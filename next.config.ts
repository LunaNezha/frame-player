import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/framer-player",
  assetPrefix: "/framer-player/",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
