import { PLAYBACK_RATES } from "@/constants/player";
import { ControlMenu } from "./ControlMenu";

interface PlaybackSpeedControlProps {
  rate: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRateChange: (rate: number) => void;
}

export function PlaybackSpeedControl({
  rate,
  open,
  onOpenChange,
  onRateChange,
}: PlaybackSpeedControlProps) {
  return (
    <ControlMenu
      label="Playback speed"
      display={<span className="player-speed-label">{rate}×</span>}
      options={PLAYBACK_RATES.map((value) => ({
        value: String(value),
        label: `${value}×`,
        description: value === 1 ? "Normal" : undefined,
      }))}
      value={String(rate)}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={(value) => onRateChange(Number(value))}
    />
  );
}
