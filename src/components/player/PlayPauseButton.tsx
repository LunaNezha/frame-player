import { PlayerIcon } from "./PlayerIcon";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function PlayPauseButton({ isPlaying, onToggle }: PlayPauseButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isPlaying ? "Pause" : "Play"}
      title={isPlaying ? "Pause" : "Play"}
      className="player-button player-play-button"
    >
      <PlayerIcon name={isPlaying ? "pause" : "play"} />
    </button>
  );
}
