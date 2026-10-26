import { PlayerPlayground } from "@/components/demo/PlayerPlayground";
import { PlayerIcon } from "@/components/player/PlayerIcon";

export default function HomePage() {
  return (
    <main className="demo-shell min-h-screen px-4 pb-12 pt-6 sm:px-8 sm:pt-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <span
              className="grid size-8 place-items-center rounded-lg border border-indigo-300/20 bg-indigo-300/10 text-xs text-indigo-200"
              aria-hidden="true"
            >
              <PlayerIcon name="play" width="14" height="14" />
            </span>
            <span className="text-xs font-semibold tracking-[0.22em]">
              FRAME
              <span className="ml-3 font-normal tracking-normal text-zinc-500">
                / player
              </span>
            </span>
          </div>
          <a
            href="#integration"
            className="inline-flex min-h-11 items-center rounded-full border border-white/10 px-4 text-xs text-zinc-300 transition-colors hover:bg-white/5"
          >
            Integration guide ↗
          </a>
        </header>
        <section className="pb-8 pt-12 sm:pb-10 sm:pt-16">
          <p className="mb-4 text-[10px] tracking-[0.25em] text-indigo-200/80">
            LESS INTERFACE. MORE IMMERSION.
          </p>
          <h1 className="text-3xl font-medium tracking-tight sm:text-5xl">
            Every frame.{" "}
            <span className="text-zinc-500">Nothing in the way.</span>
            <span className="sr-only"> React Video Player</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
            A considered playback experience for your next project. MP4, HLS,
            typed controls, and a theme that feels like yours.
          </p>
        </section>
        <PlayerPlayground />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-7">
          <div>
            <p className="text-sm text-zinc-200">A moment in motion</p>
            <p className="mt-2 text-xs text-zinc-500">
              Sample film <span className="px-2">·</span> Original source{" "}
              <span className="px-2">·</span> 00:10
            </p>
          </div>
          <span className="flex items-center gap-2 text-[10px] tracking-wider text-zinc-400">
            <span className="size-1.5 rounded-full bg-indigo-300" /> CUSTOM
            CONTROLS. NATIVE PLAYBACK.
          </span>
        </div>
        <footer className="flex flex-wrap items-center justify-between gap-4 pt-6 text-[11px] text-zinc-500">
          <span>Focus the player. Make yourself at home.</span>
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-2">
              <kbd className="demo-kbd">Space</kbd> Play / pause
            </span>
            <span className="flex items-center gap-2">
              <kbd className="demo-kbd">←</kbd>
              <kbd className="demo-kbd">→</kbd> Seek
            </span>
            <span className="flex items-center gap-2">
              <kbd className="demo-kbd">M</kbd> Mute
            </span>
            <span className="flex items-center gap-2">
              <kbd className="demo-kbd">F</kbd> Fullscreen
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
