import type { PlayerStyle } from "@/types/player";
import { PlayerIcon } from "./PlayerIcon";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const silent = isMuted || volume === 0;
  return (
    <div className="player-volume">
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={silent ? "Unmute" : "Mute"}
        aria-pressed={silent}
        title={silent ? "Unmute" : "Mute"}
        className="player-button"
      >
        <PlayerIcon name={silent ? "muted" : "volume"} />
      </button>
      <input
        type="range"
        aria-label="Volume"
        aria-valuetext={`${Math.round((silent ? 0 : volume) * 100)} percent`}
        min={0}
        max={1}
        step={0.01}
        value={silent ? 0 : volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        style={
          {
            "--player-volume": `${(silent ? 0 : volume) * 100}%`,
          } as PlayerStyle
        }
        className="player-volume-slider"
      />
    </div>
  );
}
