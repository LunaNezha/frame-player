"use client";

import { useMemo } from "react";
import type { ReactVideoPlayerProps, VideoSource } from "@/types/player";
import VideoPlayer from "./VideoPlayer";

export function ReactVideoPlayer({
  src,
  type,
  options,
  ...props
}: ReactVideoPlayerProps) {
  const sources = useMemo<readonly [VideoSource]>(() => {
    const pathname = src.split(/[?#]/, 1)[0].toLowerCase();
    const sourceType =
      type ??
      (pathname.endsWith(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : pathname.endsWith(".webm")
          ? "video/webm"
          : "video/mp4");
    return [{ id: src, src, type: sourceType, label: "Original" }];
  }, [src, type]);

  return <VideoPlayer {...options} {...props} sources={sources} />;
}
