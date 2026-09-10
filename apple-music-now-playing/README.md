# Apple Music Now Playing — Twitch Widget

A clean, rectangular "now playing" overlay for Twitch (or any OBS scene) that
shows the song currently playing in the **Apple Music web player**
(`music.apple.com`), updating live as tracks change.

## How it works

Apple doesn't provide a public API for reading what's playing in an already
open browser tab, so this is built from three small pieces:

```
music.apple.com tab  --(Chrome extension)-->  local server  --(WebSocket)-->  OBS widget page
```

1. **Browser extension** — a content script on `music.apple.com` reads the
   current track via the standard [Media Session
   API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API)
   (the same info the OS uses for lock-screen / hardware media-key controls),
   with a DOM-scraping fallback if that's ever empty.
2. **Local relay server** (Node.js) — receives updates from the extension and
   broadcasts them to any connected widget pages. Binds to `127.0.0.1` only.
3. **Widget page** — a small HTML page you add as an OBS Browser Source. It
   connects to the local server and renders the current track.

You keep using `music.apple.com` normally in a regular Chrome tab — the
widget just mirrors it.

## Setup

### 1. Install the extension

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `extension/` folder in this
   project.
4. Open `https://music.apple.com`, sign in, and start playing something.
   Keep that tab open somewhere (it can be minimized/backgrounded).

### 2. Run the local server

```bash
cd server
npm install
node server.js
```

Leave this running in a terminal while you stream. You should see:

```
Apple Music widget server running at http://localhost:8787
```

### 3. Add the widget to OBS

1. In OBS, add a **Browser Source**.
2. URL: `http://localhost:8787`
3. Width: `380`, Height: `72` (matches the card; adjust if you resize it in
   `widget/style.css`).
4. Leave **Shutdown source when not visible** unchecked so it keeps
   reconnecting in the background.
5. Position it in whichever corner you like — the widget background is
   transparent, so no color key is needed.

The card fades in when a track is detected and fades out when nothing is
playing, so it won't sit on screen empty.

## Customizing

- **Look & size** — edit `widget/style.css` (colors, corner radius, size,
  the red equalizer accent, font).
- **Port** — the server defaults to `8787`. Override with
  `PORT=9000 node server.js` and update the extension's `SERVER_URL` in
  `extension/background.js` and the OBS Browser Source URL to match.
- **DOM fallback selectors** — if Apple changes their web player and the
  Media Session fallback ever needs it, update
  `DOM_FALLBACK_SELECTORS` at the top of `extension/content-script.js`.
  Open DevTools on `music.apple.com`, right-click the song title/artist in
  the player bar → Inspect, and copy the new selector.

## Troubleshooting

- **Widget stays blank** — confirm `node server.js` is running and the
  `music.apple.com` tab is open and actively playing a track (Media Session
  metadata is only populated during playback).
- **Extension not sending data** — go to `chrome://extensions`, find "Apple
  Music Now Playing Bridge", click **service worker** under "Inspect views"
  to open its console and check for connection errors to
  `ws://localhost:8787`.
- **Nothing at all shows up** — check the terminal running `server.js` for
  errors, and make sure no firewall/security software is blocking local
  loopback connections.

## Privacy

Everything runs on your own machine. The extension only reads the
now-playing metadata Apple's web player already exposes for OS-level media
controls — it doesn't touch your Apple ID, account data, or anything beyond
the currently playing track's title/artist/album/artwork.
