import type { PlayerHotkeys, VideoThumbnail } from "@/types/player";
import { publicAsset } from "@/utils/publicAsset";

export const DEFAULT_VOLUME = 0.3;
export const PLAYBACK_RATES = [0.5, 1, 1.5, 2] as const;
export const DEFAULT_HOTKEYS: PlayerHotkeys = {
  playPause: " ",
  mute: "m",
  fullscreen: "f",
  seekBackward: "ArrowLeft",
  seekForward: "ArrowRight",
  volumeUp: "ArrowUp",
  volumeDown: "ArrowDown",
};
export const SAMPLE_THUMBNAILS: readonly VideoThumbnail[] = Array.from(
  { length: 5 },
  (_, index) => ({
    start: index * 2,
    end: index * 2 + 2,
    src: publicAsset(`/images/thumbnails/sample-${index + 1}.jpg`),
  }),
);
