import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/frame-player",
  assetPrefix: "/frame-player/",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
