import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";
import VideoPlayer from "@/components/player/VideoPlayer";

const mockHls = {
  isSupported: jest.fn(() => true),
  loadSource: jest.fn(),
  attachMedia: jest.fn(),
  destroy: jest.fn(),
  on: jest.fn<(event: string, callback: unknown) => void>(),
  setLevel: jest.fn(),
};

jest.mock("hls.js", () => ({
  __esModule: true,
  default: class {
    static isSupported = mockHls.isSupported;
    static Events: { ERROR: string; MANIFEST_PARSED: string } = {
      ERROR: "hlsError",
      MANIFEST_PARSED: "hlsManifestParsed",
    };
    set currentLevel(value: number) {
      mockHls.setLevel(value);
    }
    loadSource = mockHls.loadSource;
    attachMedia = mockHls.attachMedia;
    destroy = mockHls.destroy;
    on = mockHls.on;
  },
}));

const sources = [
  {
    id: "hls",
    src: "/stream.m3u8?token=example",
    label: "Adaptive",
    type: "application/vnd.apple.mpegurl",
  },
] as const;

describe("HLS playback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockHls.isSupported.mockReturnValue(true);
    jest.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    jest
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => {});
    jest.spyOn(HTMLMediaElement.prototype, "canPlayType").mockReturnValue("");
  });
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it("prefers native HLS support", () => {
    jest
      .mocked(HTMLMediaElement.prototype.canPlayType)
      .mockReturnValue("probably");
    render(<VideoPlayer sources={sources} />);
    expect(
      screen
        .getByLabelText<HTMLVideoElement>("Video player", { selector: "video" })
        .getAttribute("src"),
    ).toBe(sources[0].src);
    expect(mockHls.attachMedia).not.toHaveBeenCalled();
  });

  it("lazy-loads HLS and destroys the instance on unmount", async () => {
    const { unmount } = render(<VideoPlayer sources={sources} />);
    await waitFor(() => expect(mockHls.attachMedia).toHaveBeenCalledTimes(1));
    expect(mockHls.loadSource).toHaveBeenCalledWith(sources[0].src);
    unmount();
    expect(mockHls.destroy).toHaveBeenCalledTimes(1);
  });

  it("reports unsupported HLS playback", async () => {
    mockHls.isSupported.mockReturnValue(false);
    render(<VideoPlayer sources={sources} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "HLS playback is not supported",
    );
  });

  it("reports fatal HLS errors", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<VideoPlayer sources={sources} />);
    await waitFor(() => expect(mockHls.on).toHaveBeenCalledTimes(2));
    const handleError = mockHls.on.mock.calls.find(
      ([event]) => event === "hlsError",
    )![1] as (event: string, data: { fatal: boolean; details: string }) => void;
    act(() =>
      handleError("hlsError", { fatal: true, details: "networkError" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The video stream could not be loaded",
    );
    expect(log).toHaveBeenCalledWith(
      "[Frame Player] Fatal HLS error",
      expect.objectContaining({ src: sources[0].src, details: "networkError" }),
    );
    act(() => screen.getByRole("button", { name: "Try again" }).click());
    await waitFor(() => expect(mockHls.attachMedia).toHaveBeenCalledTimes(2));
    expect(mockHls.destroy).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("offers only manifest qualities and switches between manual and Auto levels", async () => {
    const onQualityChange = jest.fn();
    render(<VideoPlayer sources={sources} onQualityChange={onQualityChange} />);
    await waitFor(() => expect(mockHls.on).toHaveBeenCalledTimes(2));
    const onManifest = mockHls.on.mock.calls.find(
      ([event]) => event === "hlsManifestParsed",
    )![1] as (
      event: string,
      data: { levels: { height: number; bitrate: number }[] },
    ) => void;
    act(() =>
      onManifest("hlsManifestParsed", {
        levels: [
          { height: 720, bitrate: 2000000 },
          { height: 1080, bitrate: 4000000 },
        ],
      }),
    );
    act(() => screen.getByRole("button", { name: "Video quality" }).click());
    expect(screen.getByRole("menuitemradio", { name: /Auto/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    act(() => screen.getByRole("menuitemradio", { name: "1080p" }).click());
    expect(mockHls.setLevel).toHaveBeenLastCalledWith(1);
    expect(onQualityChange).toHaveBeenCalledWith({
      level: 1,
      height: 1080,
      label: "1080p",
    });
    act(() => screen.getByRole("button", { name: "Video quality" }).click());
    act(() => screen.getByRole("menuitemradio", { name: /Auto/ }).click());
    expect(mockHls.setLevel).toHaveBeenLastCalledWith(-1);
    expect(onQualityChange).toHaveBeenLastCalledWith(null);
  });
});
