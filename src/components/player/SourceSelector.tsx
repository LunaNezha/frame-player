import type { VideoQuality, VideoSource } from "@/types/player";
import { ControlMenu } from "./ControlMenu";
import { PlayerIcon } from "./PlayerIcon";

interface SourceSelectorProps {
  sources: readonly VideoSource[];
  activeSourceId: string;
  qualityLevels: readonly VideoQuality[];
  selectedQuality: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSourceChange: (sourceId: string) => void;
  onQualityChange: (level: number) => void;
}

export function SourceSelector({
  sources,
  activeSourceId,
  qualityLevels,
  selectedQuality,
  open,
  onOpenChange,
  onSourceChange,
  onQualityChange,
}: SourceSelectorProps) {
  const adaptive = qualityLevels.length > 0;
  const source = sources.find((entry) => entry.id === activeSourceId);
  const selected = adaptive
    ? (qualityLevels.find((level) => level.level === selectedQuality)?.label ??
      "Auto")
    : (source?.label ?? "Original");
  const options = [
    ...sources
      .filter((entry) => !adaptive || entry.id !== activeSourceId)
      .map((entry) => ({
        value: `source:${entry.id}`,
        label: entry.label,
        description: sources.length === 1 ? "Source" : undefined,
      })),
    ...(adaptive
      ? [
          {
            value: "level:-1",
            label: "Auto",
            description: "Adapts to your connection",
          },
          ...[...qualityLevels]
            .sort((first, second) => second.height - first.height)
            .map((level) => ({
              value: `level:${level.level}`,
              label: level.label,
            })),
        ]
      : []),
  ];
  return (
    <ControlMenu
      label="Video quality"
      display={
        <>
          <PlayerIcon name="settings" />
          <span className="player-quality-label">{selected}</span>
        </>
      }
      options={options}
      value={adaptive ? `level:${selectedQuality}` : `source:${activeSourceId}`}
      open={open}
      onOpenChange={onOpenChange}
      onSelect={(value) => {
        if (value.startsWith("level:")) onQualityChange(Number(value.slice(6)));
        else onSourceChange(value.slice(7));
      }}
    />
  );
}
