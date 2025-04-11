import ffmpeg from 'fluent-ffmpeg';
import { promises as fs, createWriteStream } from 'fs';
import { Readable } from 'stream';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import path from 'path';

type Resolution = {
  size: '1280x720' | '854x480' | '640x360';
  bitrate: '3000k' | '1600k' | '1024k';
  isUploaded: boolean;
};

const video = process.env.INPUT_VIDEO;
const outputDir = path.join(__dirname, '..', 'output');

const s3 = new S3Client({
  region: 'ap-south-1',
});

async function main() {
  if (!video) {
    throw new Error('No video input provided! Exiting...');
  }

  console.log(`Transcoding video: ${video}`);

  const videoPath = await downloadFromS3(video);

  const resolutions: Resolution[] = [
    { size: '1280x720', bitrate: '3000k', isUploaded: false },
    { size: '854x480', bitrate: '1600k', isUploaded: false },
    { size: '640x360', bitrate: '1024k', isUploaded: false },
  ];

  resolutions.forEach((resolution) => {
    const { size, bitrate } = resolution;

    ffmpeg(videoPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .addOption('-preset', 'superfast')
      .addOption('-g', '50')
      .addOption('-sc_threshold', '0')
      .size(size)
      .videoBitrate(bitrate)
      .audioBitrate('128k')
      .audioChannels(2)
      .outputOptions([
        '-f hls',
        '-hls_time 10',
        '-hls_playlist_type vod',
        `-hls_segment_filename version_${size}/data-%Y%m%d-%s.ts`,
        '-strftime 1',
        '-use_localtime_mkdir 1',
        '-max_muxing_queue_size 9999',
      ])
      .output(`version_${size}.m3u8`)
      .on('progress', (progress) => {
        if (!progress.percent) return;
        console.log(
          `Processing ${size}: ${Math.floor(progress.percent * 100) / 100}% done`,
        );
      })
      .on('end', async () => {
        console.log(`Transcoding finished for ${size}`);
        await uploadToS3(resolution);

        const hasAllUploaded = resolutions.every((res) => res.isUploaded);
        if (hasAllUploaded) {
          await updateJobStatus(video);
          //TODO: remove the video from temporary S3 bucket
        }
      })
      .on('error', (err) => {
        console.error(`Error transcoding video: ${err.message}`);
      })
      .run();
  });

  const masterPlaylist = resolutions
    .map(
      ({ size, bitrate }) =>
        `#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=${parseInt(bitrate) * 1000},RESOLUTION=${size}\nversion_${size}.m3u8`,
    )
    .join('\n');

  await fs.writeFile(path.join(outputDir, 'index.m3u8'), masterPlaylist);

  await uploadToS3('master');
}

async function uploadToS3(resolution: Resolution | 'master') {
  if (resolution === 'master') {
    console.log(`Uploading master playlist to S3...`);

    const masterPlaylist = await fs.readFile(
      path.join(outputDir, 'index.m3u8'),
    );

    const s3PutCommand = new PutObjectCommand({
      Bucket: 'brightpath-dev',
      Key: `hls/${video}/index.m3u8`,
      Body: masterPlaylist,
    });

    await s3.send(s3PutCommand);

    return;
  }

  const { size } = resolution;

  console.log(`Uploading ${size} to S3...`);

  const files = await fs.readdir(path.join(outputDir, `version_${size}`));
  const promises = [];

  files.forEach(async (filename, i) => {
    console.log(`Uploading ${size}: ${i} / ${files.length} files`);

    const file = await fs.readFile(
      path.join(outputDir, `version_${size}`, filename),
    );

    const s3PutCommand = new PutObjectCommand({
      Bucket: 'brightpath-dev',
      Key: `hls/${video}/version_${size}/${filename}`,
      Body: file,
    });

    promises.push(s3.send(s3PutCommand));
  });

  const playlist = await fs.readFile(
    path.join(outputDir, `version_${size}.m3u8`),
  );

  const s3PutCommand = new PutObjectCommand({
    Bucket: 'brightpath-dev',
    Key: `hls/${video}/version_${size}.m3u8`,
    Body: playlist,
  });

  promises.push(s3.send(s3PutCommand));

  await Promise.all(promises);

  resolution.isUploaded = true;
}

async function downloadFromS3(key: string): Promise<string> {
  const tempPath = path.join(__dirname, '..', key);

  const command = new GetObjectCommand({
    Bucket: 'brightpath-dev-temp',
    Key: video,
  });

  const response = await s3.send(command);

  if (!response.Body || !(response.Body instanceof Readable)) {
    throw new Error('No video found in S3');
  }

  return new Promise((resolve, reject) => {
    const writeStream = createWriteStream(tempPath);
    const buffer = Readable.from(response.Body as Readable);
    buffer.pipe(writeStream);

    writeStream.on('finish', () => {
      resolve(tempPath);
    });

    writeStream.on('error', reject);
  });
}

const updateJobStatus = async (key: string) => {
  const baseUrl = process.env.BACKEND_URL;

  try {
    const response = await fetch(
      `${baseUrl}/api/module/video/status/${key}?status=COMPLETED`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error updating job status: ${response.statusText}`);
    }

    await response.json();
    console.log('Job status updated successfully');
  } catch (error) {
    console.error('Error updating job status');
    throw error;
  }
};

main();
