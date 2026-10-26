"use client";

import { useState } from "react";
import { ReactVideoPlayer } from "@/components/player";
import type {
  PlayerControlsVisibility,
  ReactVideoPlayerOptions,
} from "@/components/player";
import { SAMPLE_THUMBNAILS } from "@/constants/player";

const examples = {
  mp4: {
    label: "Standard MP4",
    src: "/videos/sample-video.mp4",
    description:
      "Direct MP4 playback with preview thumbnails. No streaming service required.",
  },
  hls: {
    label: "HLS stream",
    src: "/videos/hls/sample.m3u8",
    description:
      "A local, single-rendition HLS VOD stream. Native HLS when available, hls.js otherwise. This fixture is not an adaptive quality ladder.",
  },
  styled: {
    label: "Custom styled",
    src: "/videos/sample-video.mp4",
    description:
      "The same player, with mint accents, softer corners, and a denser glass surface. No component fork.",
  },
  autoplay: {
    label: "Muted autoplay",
    src: "/videos/sample-video.mp4",
    description:
      "Autoplay is requested muted and inline. Your browser may still block it; press play to continue.",
  },
} as const;

const controlLabels: Record<keyof PlayerControlsVisibility, string> = {
  playPause: "Play / pause",
  progress: "Scrub bar",
  volume: "Volume",
  quality: "Quality selector",
  playbackSpeed: "Playback speed",
  fullscreen: "Fullscreen",
};

export function PlayerPlayground() {
  const [example, setExample] = useState<keyof typeof examples>("mp4");
  const [controls, setControls] = useState<PlayerControlsVisibility>({});
  const [hotkeys, setHotkeys] = useState(true);
  const [showDuration, setShowDuration] = useState(true);
  const [loop, setLoop] = useState(true);
  const [lastEvent, setLastEvent] = useState("Ready to play");
  const selected = examples[example];
  const options: ReactVideoPlayerOptions = {
    controls,
    hotkeys: hotkeys ? {} : false,
    showDuration,
    loop,
    muted: true,
    autoPlay: example === "autoplay",
    thumbnails: SAMPLE_THUMBNAILS,
  };
  const theme =
    example === "styled"
      ? {
          primaryColor: "#6ee7b7",
          borderRadius: "32px",
          backgroundOpacity: 0.9,
        }
      : undefined;
  const snippet = `<ReactVideoPlayer\n  src=${JSON.stringify(selected.src)}\n  poster="/images/video-poster.jpg"\n  options={${JSON.stringify({ ...options, thumbnails: undefined }, null, 2)}}${theme ? `\n  theme={${JSON.stringify(theme, null, 2)}}` : ""}\n/>`;

  return (
    <section
      id="playground"
      aria-labelledby="playground-heading"
      className="scroll-mt-8"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <h2
          id="playground-heading"
          className="text-sm font-medium text-zinc-200"
        >
          The interactive playground
        </h2>
        <span className="text-xs text-zinc-400">
          Real media. Real controls.
        </span>
      </div>
      <div
        role="group"
        aria-label="Player examples"
        className="mb-5 flex flex-wrap gap-2"
      >
        {Object.entries(examples).map(([key, item]) => (
          <button
            key={key}
            type="button"
            aria-pressed={example === key}
            onClick={() => {
              setExample(key as keyof typeof examples);
              setLastEvent("Ready to play");
            }}
            className={`min-h-11 rounded-xl border px-4 text-xs transition-colors ${example === key ? "border-indigo-300/40 bg-indigo-300/10 text-indigo-100" : "border-white/10 text-zinc-400 hover:border-white/30 hover:text-white"}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <ReactVideoPlayer
        key={example}
        src={selected.src}
        poster="/images/video-poster.jpg"
        title={example === "mp4" ? "Sample video" : selected.label}
        options={options}
        theme={theme}
        onPlay={() => setLastEvent("onPlay · Playback started")}
        onPause={() => setLastEvent("onPause · Playback paused")}
        onEnded={() => setLastEvent("onEnded · Playback finished")}
        onError={(message) => setLastEvent(`onError · ${message}`)}
      />
      <p className="mt-4 text-sm leading-6 text-zinc-400">
        {selected.description}
      </p>
      <p role="status" className="mt-2 text-xs text-indigo-200">
        {lastEvent}
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <fieldset className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <legend className="px-2 text-sm text-zinc-200">Make it yours</legend>
          <p className="mb-4 text-xs leading-6 text-zinc-400">
            Toggle the UI live. Hidden controls do not disable their keyboard
            actions. Click the video to play, even with the dock play button
            hidden.
          </p>
          <div className="grid grid-cols-2 gap-x-4">
            {(
              Object.entries(controlLabels) as [
                keyof PlayerControlsVisibility,
                string,
              ][]
            ).map(([control, label]) => (
              <label
                key={control}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-xs text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={controls[control] !== false}
                  onChange={(event) =>
                    setControls({
                      ...controls,
                      [control]: event.target.checked,
                    })
                  }
                  className="size-4 accent-indigo-300"
                />
                {label}
              </label>
            ))}
            {[
              { label: "Hotkeys", checked: hotkeys, update: setHotkeys },
              {
                label: "Time display",
                checked: showDuration,
                update: setShowDuration,
              },
              { label: "Loop video", checked: loop, update: setLoop },
            ].map(({ label, checked, update }) => (
              <label
                key={label}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-xs text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => update(event.target.checked)}
                  className="size-4 accent-indigo-300"
                />
                {label}
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setControls({});
              setHotkeys(true);
              setShowDuration(true);
              setLoop(true);
            }}
            className="mt-4 min-h-11 rounded-lg border border-white/15 px-4 text-xs text-zinc-300 transition-colors hover:bg-white/10"
          >
            Reset options
          </button>
        </fieldset>
        <div className="min-w-0 rounded-2xl border border-white/10 bg-black/30 p-5">
          <h3 className="mb-4 text-sm text-zinc-200">Your configuration</h3>
          <pre
            tabIndex={0}
            aria-label="Player configuration code"
            className="max-h-80 overflow-auto text-xs leading-6 text-indigo-200"
          >
            <code>{snippet}</code>
          </pre>
        </div>
      </div>
      <div
        id="integration"
        className="mt-10 rounded-2xl border border-white/10 p-6"
      >
        <h2 className="text-lg text-zinc-100">
          One import. Your playback experience.
        </h2>
        <pre
          tabIndex={0}
          className="my-4 overflow-auto text-xs leading-7 text-indigo-200"
        >
          <code>
            {
              'import { ReactVideoPlayer } from "@/components/player";\n\n<ReactVideoPlayer src="/movie.mp4" poster="/poster.jpg" />'
            }
          </code>
        </pre>
        <p className="text-sm leading-7 text-zinc-400">
          Source-distributed, not published to npm. Copy the player, hooks,
          types, utilities, constants, and stylesheet into your Next.js project.
          See the README for setup, all options, callback signatures, and App
          Router examples.
        </p>
        <a
          href="https://github.com/LunaNezha/react-video-player#readme"
          className="mt-3 inline-flex min-h-11 items-center text-sm text-indigo-200 underline underline-offset-4"
        >
          Read the integration guide →
        </a>
      </div>
    </section>
  );
}
