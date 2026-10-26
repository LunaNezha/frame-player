import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import { ReactVideoPlayer } from "./index";

describe("public ReactVideoPlayer API", () => {
  beforeEach(() => {
    jest.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    jest
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
    jest
      .spyOn(HTMLMediaElement.prototype, "canPlayType")
      .mockReturnValue("probably");
  });
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it.each(["/film.mp4", "/film.webm", "/film.M3U8?token=abc#stream"])(
    "accepts a direct source: %s",
    (src) => {
      render(<ReactVideoPlayer src={src} />);
      expect(
        screen.getByLabelText("Video player", { selector: "video" }),
      ).toHaveAttribute("src", src);
      if (src.includes("M3U8")) {
        expect(HTMLMediaElement.prototype.canPlayType).toHaveBeenCalledWith(
          "application/vnd.apple.mpegurl",
        );
      }
    },
  );

  it("keeps callbacks, classes, themes, and control options composable", () => {
    const onEnded = jest.fn();
    const onTimeUpdate = jest.fn();
    render(
      <ReactVideoPlayer
        src="/movie.mp4"
        poster="/poster.jpg"
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        className="custom-root"
        classNames={{ video: "custom-video", controls: "custom-dock" }}
        theme={{ primaryColor: "#6ee7b7" }}
        options={{
          loop: false,
          showDuration: false,
          controls: {
            volume: false,
            quality: false,
            playbackSpeed: false,
            fullscreen: false,
            progress: false,
            playPause: false,
          },
        }}
      />,
    );
    const video = screen.getByLabelText<HTMLVideoElement>("Video player", {
      selector: "video",
    });
    expect(video).toHaveClass("custom-video");
    expect(video).toHaveAttribute("poster", "/poster.jpg");
    expect(video.loop).toBe(false);
    expect(screen.getByRole("region")).toHaveClass("custom-root");
    expect(
      screen.getByRole("region").style.getPropertyValue("--player-primary"),
    ).toBe("#6ee7b7");
    expect(screen.getByRole("group")).toHaveClass("custom-dock");
    expect(screen.queryByRole("slider")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Video quality" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play video" }),
    ).toBeInTheDocument();
    Object.defineProperty(video, "duration", { value: 60, configurable: true });
    video.currentTime = 12;
    fireEvent.timeUpdate(video);
    expect(onTimeUpdate).toHaveBeenCalledWith(12, 60);
    fireEvent.ended(video);
    expect(onEnded).toHaveBeenCalledTimes(1);
  });

  it("updates the source without remounting the component", () => {
    const { rerender } = render(<ReactVideoPlayer src="/one.mp4" />);
    const video = screen.getByLabelText("Video player", { selector: "video" });
    rerender(<ReactVideoPlayer src="/two.webm" />);
    expect(video).toHaveAttribute("src", "/two.webm");
  });
});
