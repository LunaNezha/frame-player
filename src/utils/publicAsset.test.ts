import { afterEach, describe, expect, it } from "@jest/globals";
import { publicAsset } from "./publicAsset";

const originalBasePath = process.env.NEXT_PUBLIC_BASE_PATH;
afterEach(() => {
  if (originalBasePath === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = originalBasePath;
});

describe("demo public assets", () => {
  it("defaults to the GitHub Pages project path", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(publicAsset("/videos/sample-video.mp4")).toBe(
      "/frame-player/videos/sample-video.mp4",
    );
    expect(publicAsset("/videos/hls/sample.m3u8")).toBe(
      "/frame-player/videos/hls/sample.m3u8",
    );
    expect(publicAsset("/images/video-poster.jpg")).toBe(
      "/frame-player/images/video-poster.jpg",
    );
  });

  it("supports deployment at the domain root", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "";
    expect(publicAsset("/videos/sample-video.mp4")).toBe(
      "/videos/sample-video.mp4",
    );
  });

  it("normalizes slashes for a custom deployment path", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/demo/";
    expect(publicAsset("images/thumbnails/sample-1.jpg")).toBe(
      "/demo/images/thumbnails/sample-1.jpg",
    );
  });
});
