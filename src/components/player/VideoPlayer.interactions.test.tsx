import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import VideoPlayer from "./VideoPlayer";
import type { VideoPlayerProps } from "@/types/player";

const sources = [
  { id: "original", src: "/sample.mp4", type: "video/mp4", label: "Original" },
] as const;

function setup(props: Partial<VideoPlayerProps> = {}) {
  render(<VideoPlayer sources={sources} title="Test film" {...props} />);
  const video = screen.getByLabelText<HTMLVideoElement>("Test film", {
    selector: "video",
  });
  Object.defineProperty(video, "duration", { configurable: true, value: 100 });
  fireEvent(video, new Event("durationchange"));
  return {
    video,
    player: screen.getByRole("region", { name: "Test film" }),
    dock: screen.getByRole("group", { name: "Playback controls" }),
  };
}

describe("player interactions", () => {
  beforeEach(() => {
    jest.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    jest
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
    jest
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(async function (this: HTMLMediaElement) {
        this.dispatchEvent(new Event("play"));
      });
  });
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it("auto-hides when playing, reveals on movement, and stays visible while paused", () => {
    jest.useFakeTimers();
    const { video, player, dock } = setup({ controlsHideDelay: 1000 });
    fireEvent(video, new Event("play"));
    act(() => jest.advanceTimersByTime(1001));
    expect(dock).toHaveAttribute("data-visible", "false");
    expect(dock).toHaveAttribute("inert");
    fireEvent.pointerMove(player);
    expect(dock).toHaveAttribute("data-visible", "true");
    act(() => jest.advanceTimersByTime(1001));
    fireEvent(video, new Event("pause"));
    expect(dock).toHaveAttribute("data-visible", "true");
  });

  it("keeps controls visible during menus and keyboard focus", () => {
    jest.useFakeTimers();
    const { video, dock } = setup({ controlsHideDelay: 500 });
    fireEvent(video, new Event("play"));
    fireEvent.click(screen.getByRole("button", { name: "Playback speed" }));
    act(() => jest.advanceTimersByTime(3000));
    expect(dock).toHaveAttribute("data-visible", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("changes playback speed and supports arrow navigation and Escape", () => {
    const { video } = setup();
    const trigger = screen.getByRole("button", { name: "Playback speed" });
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const normal = screen.getByRole("menuitemradio", { name: /1× Normal/ });
    expect(normal).toHaveFocus();
    fireEvent.keyDown(normal, { key: "ArrowDown" });
    const faster = screen.getByRole("menuitemradio", { name: "1.5×" });
    expect(faster).toHaveFocus();
    fireEvent.click(faster);
    expect(video.playbackRate).toBe(1.5);
    expect(video.defaultPlaybackRate).toBe(1.5);
    expect(trigger).toHaveFocus();
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("handles scoped hotkeys and does not hijack native inputs or other players", async () => {
    const { video, player } = setup();
    video.currentTime = 30;
    fireEvent(video, new Event("timeupdate"));
    fireEvent.keyDown(player, { key: "ArrowRight" });
    expect(video.currentTime).toBe(35);
    fireEvent.keyDown(player, { key: "m" });
    expect(video.muted).toBe(false);
    fireEvent.keyDown(screen.getByRole("slider", { name: "Volume" }), {
      key: "ArrowRight",
    });
    expect(video.currentTime).toBe(35);
    fireEvent.keyDown(document.body, { key: "m" });
    expect(video.muted).toBe(false);
    await act(async () => fireEvent.keyDown(player, { key: " " }));
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    expect(player.querySelector(".player-feedback")).toBeInTheDocument();
  });

  it("supports remapping or disabling hotkeys", () => {
    const { video, player } = setup({ hotkeys: { mute: "u" } });
    fireEvent.keyDown(player, { key: "m" });
    expect(video.muted).toBe(true);
    fireEvent.keyDown(player, { key: "u" });
    expect(video.muted).toBe(false);
    cleanup();
    const disabled = setup({ hotkeys: false });
    fireEvent.keyDown(disabled.player, { key: "m" });
    expect(disabled.video.muted).toBe(true);
  });

  it("renders real buffered ranges separately from played progress", () => {
    const { video } = setup();
    Object.defineProperty(video, "buffered", {
      configurable: true,
      value: {
        length: 2,
        start: (index: number) => [0, 60][index],
        end: (index: number) => [40, 80][index],
      },
    });
    fireEvent(video, new Event("progress"));
    const ranges = screen.getAllByTestId("buffered-range");
    expect(ranges[0]).toHaveStyle({ left: "0%", width: "40%" });
    expect(ranges[1]).toHaveStyle({ left: "60%", width: "20%" });
  });

  it("shows configured thumbnail cues on keyboard scrubbing and accepts theme variables", () => {
    const { player } = setup({
      theme: {
        primaryColor: "#34d399",
        borderRadius: "16px",
        backgroundOpacity: 0.8,
      },
      thumbnails: [{ start: 0, end: 50, src: "/preview.jpg" }],
    });
    const seek = screen.getByRole("slider", { name: "Seek" });
    fireEvent.focus(seek);
    expect(
      screen.getByTestId("seek-preview").querySelector("img"),
    ).toHaveAttribute("src", expect.stringContaining("/preview.jpg"));
    fireEvent.change(seek, { target: { value: "60" } });
    expect(screen.getByTestId("seek-preview").querySelector("img")).toBeNull();
    expect(player.style.getPropertyValue("--player-primary")).toBe("#34d399");
    expect(player.style.getPropertyValue("--player-radius")).toBe("16px");
    expect(player.style.getPropertyValue("--player-surface-opacity")).toBe(
      "0.8",
    );
  });
});
