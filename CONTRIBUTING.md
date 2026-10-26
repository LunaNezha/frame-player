# Contributing

Thanks for helping make playback better for everyone.

## Local development

Use Node.js 22.12 or newer. Fork and clone the repository, then run:

```sh
npm ci
npm run dev
```

The demo runs at `http://localhost:3000`.

## Before opening a pull request

- Keep changes focused. Open an issue first for API changes or new dependencies.
- Follow the existing strict TypeScript and modular component patterns.
- Update the README for changes to props, defaults, or integration steps.
- Add Jest and Testing Library coverage next to changed logic and interactions.
- Test keyboard focus, touch controls, reduced motion, narrow screens, and error states.
- Do not commit credentials, generated build files, or media you cannot redistribute.

```sh
npm run typecheck
npm run lint
npm run test.unit
npx prettier --check src docs README.md CONTRIBUTING.md
npm run build -- --webpack
```

Unit tests use Jest with the Next.js compiler and a jsdom environment. Run
`npm run test.unit:watch` for focused iteration. No separate browser-test framework
is installed. Before submitting UI changes, manually verify the demo's MP4/HLS
playback, muted autoplay, preview thumbnails, and responsive controls in a browser.

The README preview is a real player screenshot at
`docs/images/main-controls.png`. Follow the [capture guide](docs/screenshots.md)
to refresh it and add mobile, menu, fullscreen, or animated previews. Keep captures
in `docs/images` so documentation assets are not served with the demo.

To regenerate the single-rendition HLS fixture from the existing sample (requires
FFmpeg and the right to redistribute the input):

```sh
ffmpeg -i public/videos/sample-video.mp4 -c:v libx264 -preset fast -crf 25 \
  -c:a aac -force_key_frames 'expr:gte(t,n_forced*2)' \
  -hls_time 2 -hls_playlist_type vod \
  -hls_segment_filename public/videos/hls/segment-%02d.ts \
  public/videos/hls/sample.m3u8
```

Describe the problem, the implementation, and how you tested it in your PR. Include
before/after screenshots for UI changes. Please be respectful and constructive in
issues and reviews.

## Bug reports and security

For playback bugs include browser/OS, media format, reproduction steps, and a
redistributable sample URL if possible. Never post signed private URLs or tokens.
Report suspected vulnerabilities privately to `mahdie.nezhadhosseini@gmail.com`
rather than opening a public issue with exploit details.

## Licensing

Code contributions are accepted under the repository's MIT license. Third-party
dependencies and media retain their own licenses; identify their provenance when
adding assets.
