import React from 'react';
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import { mediaUrl } from '@/lib/utils';

interface VideoPlayerProps {
  source: string;
}

function VideoPlayer({ source }: VideoPlayerProps): React.JSX.Element {
  const videoUrl = mediaUrl(source);

  if (!videoUrl) {
    return <div>No video available</div>;
  }

  return (
    <div>
      <MediaPlayer src={videoUrl}>
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}

export default VideoPlayer;
