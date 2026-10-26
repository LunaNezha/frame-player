"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type Hls from "hls.js";
import { DEFAULT_VOLUME } from "@/constants/player";
import type {
  VideoPlayerControls,
  VideoPlayerProps,
  VideoPlayerState,
  VideoQuality,
  BufferedRange,
} from "@/types/player";

let currentlyPlayingVideo: HTMLVideoElement | null = null;

export function useVideoPlayer(options: VideoPlayerProps) {
  const {
    sources,
    initialSourceId,
    muted = true,
    initialVolume = DEFAULT_VOLUME,
  } = options;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [qualityState, setQualityState] = useState<{
    sourceId: string;
    levels: VideoQuality[];
    selected: number;
  }>({ sourceId: "", levels: [], selected: -1 });
  const callbacksRef = useRef(options);
  const resumeRef = useRef<{ time: number; playing: boolean } | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState(
    initialSourceId ?? sources[0].id,
  );
  const activeSource =
    sources.find((source) => source.id === selectedSourceId) ?? sources[0];
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    isMuted: muted,
    isFullscreen: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    volume: Math.min(
      1,
      Math.max(
        0,
        Number.isFinite(initialVolume) ? initialVolume : DEFAULT_VOLUME,
      ),
    ),
    error: null,
    playbackRate: 1,
    buffered: [],
  });

  useEffect(() => {
    callbacksRef.current = options;
  });

  const reportError = useCallback((message: string) => {
    setState((previous) => ({ ...previous, error: message, isLoading: false }));
    callbacksRef.current.onError?.(message);
  }, []);

  const play = useCallback(async () => {
    try {
      await videoRef.current?.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      reportError(
        error instanceof Error ? error.message : "Playback could not start.",
      );
    }
  }, [reportError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      if (currentlyPlayingVideo && currentlyPlayingVideo !== video)
        currentlyPlayingVideo.pause();
      currentlyPlayingVideo = video;
      setState((previous) => ({ ...previous, isPlaying: true, error: null }));
      callbacksRef.current.onPlay?.();
    };
    const onPause = () => {
      setState((previous) => ({ ...previous, isPlaying: false }));
      callbacksRef.current.onPause?.();
    };
    const onEnded = () => {
      setState((previous) => ({ ...previous, isPlaying: false }));
      callbacksRef.current.onEnded?.();
    };
    const onTimeUpdate = () => {
      setState((previous) => ({ ...previous, currentTime: video.currentTime }));
      callbacksRef.current.onTimeUpdate?.(
        video.currentTime,
        Number.isFinite(video.duration) ? video.duration : 0,
      );
    };
    const onDurationChange = () => {
      setState((previous) => ({
        ...previous,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
      }));
    };
    const onProgress = () => {
      const buffered: BufferedRange[] = [];
      if (Number.isFinite(video.duration) && video.duration > 0) {
        for (let index = 0; index < video.buffered.length; index++) {
          buffered.push({
            start: Math.max(0, video.buffered.start(index)),
            end: Math.min(video.duration, video.buffered.end(index)),
          });
        }
      }
      setState((previous) => ({ ...previous, buffered }));
    };
    const onRateChange = () => {
      setState((previous) => ({
        ...previous,
        playbackRate: video.playbackRate,
      }));
      callbacksRef.current.onPlaybackRateChange?.(video.playbackRate);
    };
    const onVolumeChange = () => {
      setState((previous) => ({
        ...previous,
        volume: video.volume,
        isMuted: video.muted,
      }));
    };
    const onLoadStart = () => {
      setState((previous) => ({
        ...previous,
        currentTime: 0,
        duration: 0,
        error: null,
        isLoading: true,
        buffered: [],
      }));
    };
    const onWaiting = () =>
      setState((previous) => ({ ...previous, isLoading: true }));
    const onReady = () =>
      setState((previous) => ({ ...previous, isLoading: false }));
    const onError = () =>
      reportError(video.error?.message || "This video could not be loaded.");
    const onFullscreenChange = () => {
      setState((previous) => ({
        ...previous,
        isFullscreen: document.fullscreenElement === containerRef.current,
      }));
    };
    const listeners = {
      play: onPlay,
      pause: onPause,
      ended: onEnded,
      timeupdate: onTimeUpdate,
      durationchange: onDurationChange,
      volumechange: onVolumeChange,
      loadstart: onLoadStart,
      waiting: onWaiting,
      canplay: onReady,
      playing: onReady,
      error: onError,
      progress: onProgress,
      loadeddata: onProgress,
      ratechange: onRateChange,
    };
    for (const [event, listener] of Object.entries(listeners))
      video.addEventListener(event, listener);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      for (const [event, listener] of Object.entries(listeners))
        video.removeEventListener(event, listener);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      if (currentlyPlayingVideo === video) currentlyPlayingVideo = null;
    };
  }, [reportError]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = Math.min(
      1,
      Math.max(
        0,
        Number.isFinite(initialVolume) ? initialVolume : DEFAULT_VOLUME,
      ),
    );
    video.muted = muted;
  }, [initialVolume, muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let hls: Hls | undefined;
    const resume = resumeRef.current;
    resumeRef.current = null;
    const onMetadata = () => {
      if (resume && Number.isFinite(video.duration))
        video.currentTime = Math.min(resume.time, video.duration);
      if (resume ? resume.playing : callbacksRef.current.autoPlay) void play();
    };
    video.addEventListener("loadedmetadata", onMetadata);

    const loadSource = async () => {
      const isHls =
        activeSource.type === "application/vnd.apple.mpegurl" ||
        activeSource.type === "application/x-mpegURL";
      if (!isHls || video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = activeSource.src;
        video.load();
        return;
      }
      const { default: HlsPlayer } = await import("hls.js");
      if (cancelled) return;
      if (!HlsPlayer.isSupported()) {
        reportError("HLS playback is not supported in this browser.");
        return;
      }
      hls = new HlsPlayer();
      hlsRef.current = hls;
      hls.on(HlsPlayer.Events.ERROR, (_event, data) => {
        if (data.fatal && !cancelled)
          reportError(`HLS playback failed: ${data.details}`);
      });
      hls.on(HlsPlayer.Events.MANIFEST_PARSED, (_event, data) => {
        if (cancelled) return;
        setQualityState({
          sourceId: activeSource.id,
          selected: -1,
          levels: data.levels.map((level, index) => ({
            level: index,
            height: level.height,
            label: level.height
              ? `${level.height}p`
              : `${Math.round(level.bitrate / 1000)} kbps`,
          })),
        });
      });
      hls.loadSource(activeSource.src);
      hls.attachMedia(video);
    };
    void loadSource().catch((error: unknown) => {
      if (!cancelled)
        reportError(
          error instanceof Error ? error.message : "Unable to load video.",
        );
    });
    return () => {
      cancelled = true;
      video.removeEventListener("loadedmetadata", onMetadata);
      hls?.destroy();
      if (hlsRef.current === hls) hlsRef.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [activeSource.id, activeSource.src, activeSource.type, play, reportError]);

  const controls: VideoPlayerControls = {
    togglePlay: async () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) await play();
      else video.pause();
    },
    seek: (time) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(time) || !Number.isFinite(video.duration))
        return;
      video.currentTime = Math.max(0, Math.min(video.duration, time));
    },
    setVolume: (volume) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(volume)) return;
      video.volume = Math.max(0, Math.min(1, volume));
      video.muted = video.volume === 0;
    },
    toggleMute: () => {
      const video = videoRef.current;
      if (!video) return;
      if (video.muted || video.volume === 0) {
        if (video.volume === 0) video.volume = DEFAULT_VOLUME;
        video.muted = false;
      } else video.muted = true;
    },
    toggleFullscreen: async () => {
      try {
        if (document.fullscreenElement === containerRef.current)
          await document.exitFullscreen();
        else if (containerRef.current?.requestFullscreen)
          await containerRef.current.requestFullscreen();
        else reportError("Fullscreen is not supported in this browser.");
      } catch (error) {
        reportError(
          error instanceof Error
            ? error.message
            : "Unable to change fullscreen mode.",
        );
      }
    },
    selectSource: (sourceId) => {
      const nextSource = sources.find((source) => source.id === sourceId);
      if (!nextSource || sourceId === activeSource.id) return;
      const video = videoRef.current;
      resumeRef.current = video
        ? { time: video.currentTime, playing: !video.paused }
        : null;
      setSelectedSourceId(sourceId);
      callbacksRef.current.onSourceChange?.(nextSource);
    },
    setPlaybackRate: (rate) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(rate) || rate < 0.25 || rate > 4) return;
      video.defaultPlaybackRate = rate;
      video.playbackRate = rate;
    },
    setQuality: (level) => {
      const hls = hlsRef.current;
      if (
        !hls ||
        qualityState.sourceId !== activeSource.id ||
        (level !== -1 &&
          !qualityState.levels.some((quality) => quality.level === level))
      )
        return;
      hls.currentLevel = level;
      setQualityState((previous) => ({ ...previous, selected: level }));
      callbacksRef.current.onQualityChange?.(
        qualityState.levels.find((quality) => quality.level === level) ?? null,
      );
    },
  };

  return {
    videoRef,
    containerRef,
    activeSource,
    state,
    controls,
    qualityLevels:
      qualityState.sourceId === activeSource.id ? qualityState.levels : [],
    selectedQuality:
      qualityState.sourceId === activeSource.id ? qualityState.selected : -1,
  };
}
