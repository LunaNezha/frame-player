import type { CSSProperties } from "react";

export interface VideoThumbnail {
  start: number;
  end: number;
  src: string;
}

export interface VideoQuality {
  level: number;
  label: string;
  height: number;
}

export interface BufferedRange {
  start: number;
  end: number;
}

export interface PlayerHotkeys {
  playPause: string;
  mute: string;
  fullscreen: string;
  seekBackward: string;
  seekForward: string;
  volumeUp: string;
  volumeDown: string;
}

export interface PlayerTheme {
  primaryColor?: string;
  borderRadius?: string;
  backgroundOpacity?: number;
}

export type PlayerStyle = CSSProperties & {
  [key: `--player-${string}`]: string | number;
};

export interface VideoSource {
  id: string;
  src: string;
  label: string;
  thumbnails?: readonly VideoThumbnail[];
  type:
    | "video/mp4"
    | "video/webm"
    | "application/vnd.apple.mpegurl"
    | "application/x-mpegURL";
}

export interface VideoPlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  buffered: BufferedRange[];
  error: string | null;
}

export interface VideoPlayerCallbacks {
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onSourceChange?: (source: VideoSource) => void;
  onError?: (message: string) => void;
  onPlaybackRateChange?: (rate: number) => void;
  onQualityChange?: (quality: VideoQuality | null) => void;
}

export interface PlayerControlsVisibility {
  playPause?: boolean;
  progress?: boolean;
  volume?: boolean;
  quality?: boolean;
  playbackSpeed?: boolean;
  fullscreen?: boolean;
}

export interface PlayerClassNames {
  video?: string;
  controls?: string;
  title?: string;
}

export interface VideoPlayerProps extends VideoPlayerCallbacks {
  sources: readonly [VideoSource, ...VideoSource[]];
  initialSourceId?: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  initialVolume?: number;
  showDuration?: boolean;
  compact?: boolean;
  className?: string;
  theme?: PlayerTheme;
  style?: PlayerStyle;
  thumbnails?: readonly VideoThumbnail[];
  controlsHideDelay?: number;
  hotkeys?: false | Partial<PlayerHotkeys>;
  controls?: PlayerControlsVisibility;
  classNames?: PlayerClassNames;
}

export type ReactVideoPlayerOptions = Omit<
  VideoPlayerProps,
  | keyof VideoPlayerCallbacks
  | "sources"
  | "initialSourceId"
  | "poster"
  | "title"
  | "className"
  | "classNames"
  | "style"
  | "theme"
>;

export interface ReactVideoPlayerProps extends VideoPlayerCallbacks {
  src: string;
  type?: VideoSource["type"];
  poster?: string;
  title?: string;
  options?: ReactVideoPlayerOptions;
  className?: string;
  classNames?: PlayerClassNames;
  style?: PlayerStyle;
  theme?: PlayerTheme;
}

export interface VideoPlayerControls {
  togglePlay: () => Promise<void>;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleFullscreen: () => Promise<void>;
  selectSource: (sourceId: string) => void;
  setPlaybackRate: (rate: number) => void;
  setQuality: (level: number) => void;
}
