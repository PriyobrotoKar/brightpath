'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { MediaPlayerInstance, MediaPlayerProps } from '@vidstack/react';
import { MediaPlayer, MediaProvider, useMediaStore } from '@vidstack/react';
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
  onCompleted?: () => void;
}

function VideoPlayer({
  source,
  load = 'visible',
  onCompleted,
}: VideoPlayerProps): React.JSX.Element {
  const player = useRef<MediaPlayerInstance>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const { duration } = useMediaStore(player);

  const videoUrl = mediaUrl(source);

  useEffect(() => {
    if (!player.current || duration === 0) return;

    const completeTimeThreshold = 0.2 * duration;

    return player.current.subscribe(({ currentTime }) => {
      if (currentTime >= completeTimeThreshold) {
        setIsCompleted(true);
      }
    });
  }, [duration]);

  useEffect(() => {
    if (!isCompleted || !onCompleted) return;

    onCompleted();
  }, [isCompleted]);

  if (!videoUrl) {
    return <div>No video available</div>;
  }

  return (
    <div>
      <MediaPlayer
        aspectRatio="16/9"
        className="rounded-lg bg-black"
        load={load}
        ref={player}
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
