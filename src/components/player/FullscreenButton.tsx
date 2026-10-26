import { PlayerIcon } from "./PlayerIcon";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onToggle: () => void;
}

export function FullscreenButton({
  isFullscreen,
  onToggle,
}: FullscreenButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      aria-pressed={isFullscreen}
      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
      className="player-button"
    >
      <PlayerIcon name={isFullscreen ? "collapse" : "expand"} />
    </button>
  );
}
