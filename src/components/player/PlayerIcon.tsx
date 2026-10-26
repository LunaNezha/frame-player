import type { SVGProps } from "react";

type IconName =
  | "play"
  | "pause"
  | "volume"
  | "muted"
  | "expand"
  | "collapse"
  | "check"
  | "settings";

const paths: Record<IconName, string> = {
  play: "m9 5 11 7-11 7V5Z",
  pause: "M8 5v14M16 5v14",
  volume: "m11 5-6 4H2v6h3l6 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  muted: "m11 5-6 4H2v6h3l6 4V5Zm5 4 6 6m0-6-6 6",
  expand: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5",
  collapse: "M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5",
  check: "m5 12 4 4L19 6",
  settings: "M4 7h10m4 0h2M4 17h2m4 0h10M14 4v6M6 14v6",
};

export function PlayerIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={name === "play" ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={name === "pause" ? 4 : 1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
