/** Resolve this demo's public assets under the build-time Next.js basePath. */
export function publicAsset(path: string): string {
  const basePath = (
    process.env.NEXT_PUBLIC_BASE_PATH ?? "/frame-player"
  ).replace(/\/+$/, "");
  return `${basePath}/${path.replace(/^\/+/, "")}`;
}
