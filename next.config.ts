/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "export",
  basePath: "/frame-player",
  assetPrefix: "/frame-player/",
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
};

export default nextConfig;
