"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { DEFAULT_HOTKEYS } from "@/constants/player";
import { usePlayerOverlay } from "@/hooks/usePlayerOverlay";
import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import type { PlayerStyle, VideoPlayerProps } from "@/types/player";
import { cn } from "@/utils/classnames";
import { formatTime } from "@/utils/formatTime";
import { FullscreenButton } from "./FullscreenButton";
import { PlaybackSpeedControl } from "./PlaybackSpeedControl";
import { PlayerIcon } from "./PlayerIcon";
import { PlayPauseButton } from "./PlayPauseButton";
import { ProgressBar } from "./ProgressBar";
import { SourceSelector } from "./SourceSelector";
import { VolumeControl } from "./VolumeControl";

export default function VideoPlayer(props: VideoPlayerProps) {
  const {
    poster,
    title = "Video player",
    loop = true,
    showDuration = true,
    compact = false,
    className,
    theme,
    style,
    controlsHideDelay = 2800,
    hotkeys,
    controls: controlVisibility = {},
    classNames,
  } = props;
  const {
    videoRef,
    containerRef,
    activeSource,
    state,
    controls,
    qualityLevels,
    selectedQuality,
  } = useVideoPlayer(props);
  const [openMenu, setOpenMenu] = useState<"quality" | "speed" | null>(null);
  const [hoveringControls, setHoveringControls] = useState(false);
  const [keyboardFocus, setKeyboardFocus] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [feedback, setFeedback] = useState<{
    id: number;
    kind: "play" | "pause";
  } | null>(null);
  const feedbackSequence = useRef(0);
  const pinned =
    hoveringControls ||
    keyboardFocus ||
    scrubbing ||
    (openMenu === "quality" && controlVisibility.quality !== false) ||
    (openMenu === "speed" && controlVisibility.playbackSpeed !== false) ||
    state.isLoading ||
    Boolean(state.error);
  const { visible, reveal } = usePlayerOverlay(
    state.isPlaying,
    pinned,
    controlsHideDelay,
  );
  const keys = { ...DEFAULT_HOTKEYS, ...(hotkeys || {}) };

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 650);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const togglePlayback = () => {
    setFeedback({
      id: ++feedbackSequence.current,
      kind: state.isPlaying ? "pause" : "play",
    });
    reveal();
    void controls.togglePlay();
  };
  const changeMenu = (name: "quality" | "speed", open: boolean) => {
    setOpenMenu((previous) =>
      open ? name : previous === name ? null : previous,
    );
    reveal();
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") {
      reveal();
      return;
    }
    if (
      hotkeys === false ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.defaultPrevented
    )
      return;
    const target = event.target as HTMLElement;
    if (
      target.closest(
        "input, select, textarea, button, [contenteditable]:not([contenteditable='false']), [role='menu']",
      )
    )
      return;
    const key = event.key.toLowerCase();
    if (
      event.repeat &&
      [keys.playPause, keys.mute, keys.fullscreen].some(
        (binding) => binding.toLowerCase() === key,
      )
    ) {
      event.preventDefault();
      return;
    }
    if (key === keys.playPause.toLowerCase()) togglePlayback();
    else if (key === keys.mute.toLowerCase()) controls.toggleMute();
    else if (key === keys.fullscreen.toLowerCase())
      void controls.toggleFullscreen();
    else if (key === keys.seekBackward.toLowerCase())
      controls.seek(state.currentTime - 5);
    else if (key === keys.seekForward.toLowerCase())
      controls.seek(state.currentTime + 5);
    else if (key === keys.volumeUp.toLowerCase())
      controls.setVolume(state.volume + 0.05);
    else if (key === keys.volumeDown.toLowerCase())
      controls.setVolume(state.volume - 0.05);
    else return;
    event.preventDefault();
    reveal();
  };
  const playerStyle: PlayerStyle = {
    ...(theme?.primaryColor ? { "--player-primary": theme.primaryColor } : {}),
    ...(theme?.borderRadius ? { "--player-radius": theme.borderRadius } : {}),
    ...(theme?.backgroundOpacity !== undefined &&
    Number.isFinite(theme.backgroundOpacity)
      ? {
          "--player-surface-opacity": Math.min(
            1,
            Math.max(0, theme.backgroundOpacity),
          ),
        }
      : {}),
    ...style,
  };

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={title}
      tabIndex={0}
      aria-keyshortcuts={
        hotkeys === false
          ? undefined
          : Object.values(keys)
              .map((key) => (key === " " ? "Space" : key))
              .join(" ")
      }
      className={cn(
        "video-player",
        compact && "player-compact",
        state.isFullscreen && "player-fullscreen",
        !visible && "player-idle",
        className,
      )}
      style={playerStyle}
      onKeyDown={handleKeyDown}
      onPointerMove={reveal}
      onPointerDown={reveal}
      onFocus={reveal}
    >
      <video
        ref={videoRef}
        aria-label={title}
        poster={poster}
        loop={loop}
        muted={props.muted ?? true}
        playsInline
        preload="metadata"
        onClick={() => {
          containerRef.current?.focus({ preventScroll: true });
          togglePlayback();
        }}
        className={cn("player-video", classNames?.video)}
      />
      <div className="player-vignette" aria-hidden="true" />
      <div
        className={cn("player-title", classNames?.title)}
        data-visible={visible}
      >
        <span className="player-live-dot" aria-hidden="true" />
        <span>{title}</span>
        <span className="player-title-tag">
          {state.isPlaying ? "NOW PLAYING" : "PRESS PLAY"}
        </span>
      </div>
      {!state.isPlaying && !feedback && !state.isLoading && !state.error && (
        <button
          type="button"
          aria-label="Play video"
          className="player-center-play"
          onClick={() => {
            containerRef.current?.focus({ preventScroll: true });
            togglePlayback();
          }}
        >
          <PlayerIcon name="play" width="28" height="28" />
          <span className="sr-only">Play video</span>
        </button>
      )}
      {feedback && !state.error && (
        <div key={feedback.id} className="player-feedback" aria-hidden="true">
          <span className="player-feedback-ring" />
          <PlayerIcon name={feedback.kind} width="28" height="28" />
        </div>
      )}
      <div
        role="group"
        aria-label="Playback controls"
        className={cn("player-dock", classNames?.controls)}
        data-visible={visible}
        inert={!visible}
        aria-hidden={!visible}
        onPointerEnter={() => setHoveringControls(true)}
        onPointerLeave={() => {
          setHoveringControls(false);
          reveal();
        }}
        onPointerDown={() => setKeyboardFocus(false)}
        onFocusCapture={(event) => {
          if (event.target.matches(":focus-visible")) setKeyboardFocus(true);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setKeyboardFocus(false);
        }}
      >
        {controlVisibility.progress !== false && (
          <ProgressBar
            currentTime={state.currentTime}
            duration={state.duration}
            buffered={state.buffered}
            thumbnails={activeSource.thumbnails ?? props.thumbnails}
            onSeek={controls.seek}
            onScrubbingChange={setScrubbing}
          />
        )}
        <div className="player-control-row">
          <div className="player-control-left">
            {controlVisibility.playPause !== false && (
              <PlayPauseButton
                isPlaying={state.isPlaying}
                onToggle={togglePlayback}
              />
            )}
            {controlVisibility.volume !== false && (
              <VolumeControl
                volume={state.volume}
                isMuted={state.isMuted}
                onVolumeChange={controls.setVolume}
                onToggleMute={controls.toggleMute}
              />
            )}
            {showDuration && (
              <span className="player-time">
                <span>{formatTime(state.currentTime)}</span>
                <span className="player-time-divider">/</span>
                <span>{formatTime(state.duration)}</span>
              </span>
            )}
          </div>
          <div className="player-control-right">
            {controlVisibility.playbackSpeed !== false && (
              <PlaybackSpeedControl
                rate={state.playbackRate}
                open={openMenu === "speed"}
                onOpenChange={(open) => changeMenu("speed", open)}
                onRateChange={controls.setPlaybackRate}
              />
            )}
            {controlVisibility.quality !== false && (
              <SourceSelector
                sources={props.sources}
                activeSourceId={activeSource.id}
                qualityLevels={qualityLevels}
                selectedQuality={selectedQuality}
                open={openMenu === "quality"}
                onOpenChange={(open) => changeMenu("quality", open)}
                onSourceChange={controls.selectSource}
                onQualityChange={controls.setQuality}
              />
            )}
            {controlVisibility.fullscreen !== false && (
              <FullscreenButton
                isFullscreen={state.isFullscreen}
                onToggle={() => void controls.toggleFullscreen()}
              />
            )}
          </div>
        </div>
      </div>
      {state.isLoading && !state.error && (
        <div role="status" className="player-loading">
          <span className="player-spinner" aria-hidden="true" />
          <span className="sr-only">Loading video…</span>
        </div>
      )}
      {state.error && (
        <div role="alert" className="player-error">
          <p>{state.error}</p>
          <button type="button" onClick={controls.retry}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
