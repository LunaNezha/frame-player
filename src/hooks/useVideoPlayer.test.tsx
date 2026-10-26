import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import VideoPlayer from "@/components/player/VideoPlayer";
import type { VideoPlayerProps } from "@/types/player";

const sources = [
  { id: "first", src: "/first.mp4", label: "First", type: "video/mp4" },
  { id: "second", src: "/second.webm", label: "Second", type: "video/webm" },
] as const satisfies VideoPlayerProps["sources"];

function getVideo() {
  return screen.getByLabelText<HTMLVideoElement>("Test video", {
    selector: "video",
  });
}

describe("video player", () => {
  beforeEach(() => {
    jest.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      this.currentTime = 0;
    });
    jest
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockImplementation(async function (this: HTMLMediaElement) {
        Object.defineProperty(this, "paused", {
          configurable: true,
          value: false,
        });
        this.dispatchEvent(new Event("play"));
      });
    jest
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(function (this: HTMLMediaElement) {
        Object.defineProperty(this, "paused", {
          configurable: true,
          value: true,
        });
        this.dispatchEvent(new Event("pause"));
      });
  });
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it("loads a direct source and synchronizes playback from media events", async () => {
    const onPlay = jest.fn();
    render(
      <VideoPlayer title="Test video" sources={sources} onPlay={onPlay} />,
    );
    expect(getVideo().getAttribute("src")).toBe("/first.mp4");
    await act(async () => screen.getByRole("button", { name: "Play" }).click());
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    expect(onPlay).toHaveBeenCalledTimes(1);
    await act(async () =>
      screen.getByRole("button", { name: "Pause" }).click(),
    );
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
  });

  it("reports rejected play promises instead of displaying a false playing state", async () => {
    jest
      .mocked(HTMLMediaElement.prototype.play)
      .mockRejectedValue(new Error("Playback denied"));
    const onError = jest.fn();
    render(
      <VideoPlayer title="Test video" sources={sources} onError={onError} />,
    );
    await act(async () => screen.getByRole("button", { name: "Play" }).click());
    expect(screen.getByRole("alert")).toHaveTextContent("Playback denied");
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith("Playback denied");
  });

  it("unmutes without losing the configured volume", () => {
    render(
      <VideoPlayer title="Test video" sources={sources} initialVolume={0.6} />,
    );
    act(() => screen.getByRole("button", { name: "Unmute" }).click());
    expect(getVideo().muted).toBe(false);
    expect(getVideo().volume).toBe(0.6);
  });

  it("restores playback position when changing sources", async () => {
    const onSourceChange = jest.fn();
    render(
      <VideoPlayer
        title="Test video"
        sources={sources}
        onSourceChange={onSourceChange}
      />,
    );
    getVideo().currentTime = 15;
    Object.defineProperty(getVideo(), "duration", {
      configurable: true,
      value: 60,
    });
    fireEvent.click(screen.getByRole("button", { name: "Video quality" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Second" }));
    await waitFor(() =>
      expect(getVideo().getAttribute("src")).toBe("/second.webm"),
    );
    expect(getVideo().currentTime).toBe(0);
    act(() => getVideo().dispatchEvent(new Event("loadedmetadata")));
    expect(getVideo().currentTime).toBe(15);
    expect(onSourceChange).toHaveBeenCalledWith(sources[1]);
  });

  it("removes event listeners and releases the source on unmount", () => {
    const onPlay = jest.fn();
    const { unmount } = render(
      <VideoPlayer title="Test video" sources={sources} onPlay={onPlay} />,
    );
    const video = getVideo();
    unmount();
    video.dispatchEvent(new Event("play"));
    expect(onPlay).not.toHaveBeenCalled();
    expect(video.hasAttribute("src")).toBe(false);
  });

  it("updates finite duration, seeking and volume through the controls", () => {
    render(<VideoPlayer title="Test video" sources={sources} />);
    const video = getVideo();
    Object.defineProperty(video, "duration", { configurable: true, value: 60 });
    act(() => video.dispatchEvent(new Event("durationchange")));
    fireEvent.change(screen.getByRole("slider", { name: "Seek" }), {
      target: { value: "30" },
    });
    expect(video.currentTime).toBe(30);
    fireEvent.change(screen.getByRole("slider", { name: "Volume" }), {
      target: { value: "0.7" },
    });
    expect(video.volume).toBe(0.7);
    expect(video.muted).toBe(false);
  });

  it("synchronizes fullscreen state from browser events", async () => {
    render(<VideoPlayer title="Test video" sources={sources} />);
    const container = screen.getByRole("region", { name: "Test video" });
    const requestFullscreen = jest
      .fn<() => Promise<void>>()
      .mockResolvedValue(undefined);
    Object.defineProperty(container, "requestFullscreen", {
      configurable: true,
      value: requestFullscreen,
    });
    await act(async () =>
      screen.getByRole("button", { name: "Enter fullscreen" }).click(),
    );
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Enter fullscreen" }),
    ).toBeInTheDocument();
    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      get: () => null,
    });
    const fullscreenElement = jest
      .spyOn(document, "fullscreenElement", "get")
      .mockReturnValue(container);
    act(() => document.dispatchEvent(new Event("fullscreenchange")));
    expect(
      screen.getByRole("button", { name: "Exit fullscreen" }),
    ).toBeInTheDocument();
    fullscreenElement.mockReturnValue(null);
    act(() => document.dispatchEvent(new Event("fullscreenchange")));
    expect(
      screen.getByRole("button", { name: "Enter fullscreen" }),
    ).toBeInTheDocument();
  });

  it("pauses the previous player when another video starts", async () => {
    render(
      <>
        <VideoPlayer title="First player" sources={sources} />
        <VideoPlayer title="Second player" sources={sources} />
      </>,
    );
    const videos = ["First player", "Second player"].map((title) =>
      screen.getByLabelText<HTMLVideoElement>(title, { selector: "video" }),
    );
    await act(async () => {
      await videos[0].play();
    });
    expect(videos[0].paused).toBe(false);
    await act(async () => {
      await videos[1].play();
    });
    expect(videos[0].paused).toBe(true);
    expect(videos[1].paused).toBe(false);
  });
});
