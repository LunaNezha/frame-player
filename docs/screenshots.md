# Screenshot capture guide

Use real browser captures of the running project. Store finished images in
`docs/images/` and reference them from the root README with that relative path.
These are documentation assets; keep runtime posters and thumbnails in `public/images/`.

## Prepare a consistent scene

1. Run `npm ci`, then `npm run dev`, and open `http://localhost:3000`.
2. Use media you have permission to redistribute. The bundled sample's provenance
   is not established; replace it and its poster before publishing captures if needed.
3. Select **Standard MP4**, choose **Reset options**, and wait for the local font,
   poster, and video metadata to load. Use the default theme for the core gallery.
4. Play briefly, then pause on the same clear frame (for example, around 4 seconds)
   for comparable stills. Leave enough progress visible to distinguish it from the
   buffered track. Keep the controls visible by pausing or focusing a control.
5. Use 100% browser zoom. Close developer tools before an OS screenshot, dismiss
   notifications, and omit browser chrome, personal information, and debug overlays.
   For device emulation, capture the viewport directly from developer tools.

## Main player controls

**File:** `docs/images/main-controls.png` (the existing README capture).

- Use a **1440 × 1000 CSS-pixel desktop viewport**, ideally at 2× pixel density.
- Crop around the player with a little consistent padding. Keep its title, full
  dock, timestamps, volume, quality, speed, and fullscreen buttons in view.
- For a scrub-preview shot, hover the seek bar after pausing. Move the pointer
  away for a clean overview. Wait for transient click feedback to finish.
- Refresh the existing image when the interface changes; do not stretch a smaller
  image to simulate a higher-resolution capture.

## Mobile / responsive

**File:** `docs/images/mobile-player.png`.

- Use a **390 × 844 CSS-pixel portrait viewport** at 2× density. Also inspect
  **320 × 568** and a landscape viewport before publishing.
- Show the player in context with the responsive dock fully visible. The mobile
  layout may be taller than 16:9; preserve that layout instead of forcing a crop.
- Check that buttons, labels, and menus stay within the viewport. Device emulation
  illustrates layout; verify playback and touch interactions on a real device too.

## Video quality menu

**File:** `docs/images/quality-menu.png`.

- On desktop, open **Video quality** and capture the entire menu, its trigger,
  selected checkmark, and enough of the player to show where the menu belongs.
- The standard MP4 offers **Original**. The bundled HLS example is single-rendition
  VOD; capture only the choices the current browser actually exposes.
- To illustrate multiple resolutions, provide your own permitted multi-source
  files or adaptive HLS manifest first. Do not add fictional quality options for
  the screenshot. Native HLS may leave quality selection to the browser.

## Playback speed menu

**File:** `docs/images/speed-menu.png`.

- Open **Playback speed** on desktop. Show **0.5×, 1×, 1.5×, and 2×** with the
  current selection visible. Match the quality shot's viewport, crop, and frame.
- Capture one open menu at a time. Wait for the opening animation to finish and
  keep the pointer clear of menu text.

## Fullscreen mode

**File:** `docs/images/fullscreen-player.png`.

- Activate the player's fullscreen button in a supporting desktop browser. Use
  an OS screenshot at **1920 × 1080** or higher; a normal viewport capture may
  omit the fullscreen surface.
- Wait for the browser's fullscreen notice to disappear, then reveal the dock
  and pause. Show the full frame, including any natural letterboxing.
- Do not simulate fullscreen by enlarging the embedded player or hiding browser
  chrome. Record the browser/OS if its fullscreen behavior affects the capture.

## Optional animation

**File:** `docs/images/player-demo.gif`.

Record a focused **6–10 second** sequence: start playback, hover the seek preview,
open a menu, select a speed, and move away to show the controls hiding. Keep it
muted, avoid rapid cuts or flashing, and trim loading and setup time.

Export at approximately **960 pixels wide and 10–15 fps**. Aim for **under 5 MB**;
shorten or reduce the frame rate if necessary. Keep a static screenshot alongside
the GIF so the README does not depend on motion. Do not commit raw recordings or
multiple draft exports. A larger MP4 can be attached to a release or issue and
linked from the README instead of increasing the repository size.

## Export and publish

- Prefer PNG for crisp interface text; use lossless compression and strip private
  metadata. Aim for **under 1 MB per still** where practical without blurring text.
- Review at the README's displayed width and open the original at full size.
  Check readable labels, visible focus/selection states, and unclipped controls.
- Add each completed file at its reserved path, move its image line out of the
  README's HTML comment, and change its gallery status to **Captured**. The pending
  slots intentionally do not render missing images.
- Use descriptive alt text for each view. Include a brief caption explaining the
  state and any browser-specific behavior; do not rely on color alone.
- Preview the rendered README and open every image link. Paths are case-sensitive
  on GitHub; use lowercase, hyphenated filenames and no leading `/`.
- Run `npx prettier --check docs README.md CONTRIBUTING.md` before submitting.
