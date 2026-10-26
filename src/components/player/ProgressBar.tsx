import { useState } from "react";
import Image from "next/image";
import type {
  BufferedRange,
  PlayerStyle,
  VideoThumbnail,
} from "@/types/player";
import { formatTime } from "@/utils/formatTime";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  buffered: readonly BufferedRange[];
  thumbnails?: readonly VideoThumbnail[];
  onSeek: (time: number) => void;
  onScrubbingChange: (scrubbing: boolean) => void;
}

export function ProgressBar({
  currentTime,
  duration,
  buffered,
  thumbnails = [],
  onSeek,
  onScrubbingChange,
}: ProgressBarProps) {
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [failedPreview, setFailedPreview] = useState<string | null>(null);
  const progress =
    duration > 0
      ? Math.min(100, Math.max(0, (currentTime / duration) * 100))
      : 0;
  const preview =
    previewTime === null
      ? undefined
      : thumbnails.find(
          (cue) => previewTime >= cue.start && previewTime < cue.end,
        );
  const previewPosition =
    previewTime !== null && duration > 0
      ? (previewTime / duration) * 100
      : progress;
  return (
    <div
      className="player-progress"
      onPointerMove={(event) => {
        if (duration <= 0) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (bounds.width <= 0) return;
        setPreviewTime(
          Math.min(
            duration,
            Math.max(
              0,
              ((event.clientX - bounds.left) / bounds.width) * duration,
            ),
          ),
        );
      }}
      onPointerLeave={() => setPreviewTime(null)}
    >
      <div className="player-progress-track" aria-hidden="true">
        {buffered.map((range, index) => (
          <span
            key={index}
            className="player-buffered-range"
            data-testid="buffered-range"
            style={{
              left: `${duration > 0 ? (range.start / duration) * 100 : 0}%`,
              width: `${duration > 0 ? (Math.max(0, range.end - range.start) / duration) * 100 : 0}%`,
            }}
          />
        ))}
        <span
          className="player-played-range"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
      <input
        type="range"
        aria-label="Seek"
        aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
        min={0}
        max={duration || 1}
        step={0.1}
        value={Math.min(currentTime, duration)}
        disabled={duration <= 0}
        className="player-seek-slider"
        style={{ "--player-progress": `${progress}%` } as PlayerStyle}
        onChange={(event) => {
          const time = Number(event.target.value);
          onSeek(time);
          setPreviewTime(time);
        }}
        onFocus={() => setPreviewTime(currentTime)}
        onBlur={() => {
          setPreviewTime(null);
          onScrubbingChange(false);
        }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture?.(event.pointerId);
          onScrubbingChange(true);
        }}
        onPointerUp={() => onScrubbingChange(false)}
        onPointerCancel={() => onScrubbingChange(false)}
      />
      {previewTime !== null && duration > 0 && (
        <div
          className="player-thumbnail"
          data-testid="seek-preview"
          style={{
            left: `clamp(5.25rem, ${previewPosition}%, calc(100% - 5.25rem))`,
          }}
          aria-hidden="true"
        >
          {preview && failedPreview !== preview.src && (
            <div className="player-thumbnail-frame">
              <Image
                unoptimized
                src={preview.src}
                fill
                sizes="160px"
                alt=""
                onError={() => setFailedPreview(preview.src)}
                className="player-thumbnail-image"
              />
            </div>
          )}
          <span>{formatTime(previewTime)}</span>
        </div>
      )}
    </div>
  );
}
