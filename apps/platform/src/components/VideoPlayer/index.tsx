'use client';
import React from 'react';
import type { MediaPlayerProps } from '@vidstack/react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import icons from './icons';
import { mediaUrl } from '@/lib/utils';

interface VideoPlayerProps {
  source: string;
  load?: MediaPlayerProps['load'];
}

function VideoPlayer({
  source,
  load = 'visible',
}: VideoPlayerProps): React.JSX.Element {
  const videoUrl = mediaUrl(source);

  if (!videoUrl) {
    return <div>No video available</div>;
  }

  return (
    <div>
      <MediaPlayer
        aspectRatio="16/9"
        className="rounded-lg bg-black"
        load={load}
        src={videoUrl}
        style={{
          '--video-border-radius': 'var(--radius)',
        }}
      >
        <MediaProvider />
        <DefaultVideoLayout
          icons={{
            ...defaultLayoutIcons,
            ...icons,
          }}
        />
      </MediaPlayer>
    </div>
  );
}

export default VideoPlayer;
