import {
  defaultLayoutIcons,
  type DefaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';
import {
  IconCast,
  IconMaximize,
  IconMinimize,
  IconPictureInPictureOff,
  IconPictureInPictureOn,
  IconPlayerPause,
  IconPlayerPlay,
  IconRestore,
  IconSettings,
  IconVolume,
  IconVolume2,
  IconVolumeOff,
} from '@tabler/icons-react';

const className = 'size-6';

const icons: Partial<DefaultLayoutIcons> = {
  PlayButton: {
    Play: () => <IconPlayerPlay className={className} />,
    Pause: () => <IconPlayerPause className={className} />,
    Replay: () => <IconRestore className={className} />,
  },
  MuteButton: {
    Mute: () => <IconVolumeOff className={className} />,
    VolumeLow: () => <IconVolume2 className={className} />,
    VolumeHigh: () => <IconVolume className={className} />,
  },
  Menu: {
    ...defaultLayoutIcons.Menu,
    Settings: () => <IconSettings className={className} />,
  },
  FullscreenButton: {
    Enter: () => <IconMaximize className={className} />,
    Exit: () => <IconMinimize className={className} />,
  },
  PIPButton: {
    Enter: () => <IconPictureInPictureOn className={className} />,
    Exit: () => <IconPictureInPictureOff className={className} />,
  },
  GoogleCastButton: {
    ...defaultLayoutIcons.GoogleCastButton,
    Default: () => <IconCast className={className} />,
  },
};

export default icons;
