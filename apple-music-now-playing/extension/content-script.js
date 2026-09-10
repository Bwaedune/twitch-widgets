// Runs on music.apple.com. Reads now-playing info and relays it to the
// extension's background service worker, which forwards it to the local
// widget server over WebSocket.
//
// Primary source: the standard Media Session API (navigator.mediaSession).
// The Apple Music web player sets this so the OS/browser can show now-playing
// info (lock screen, hardware media keys, tab media indicator), which makes
// it a far more stable source than scraping page markup. We fall back to
// scraping known player DOM elements only if Media Session data is missing.
//
// If Apple changes their markup and the DOM fallback stops working, open
// DevTools on music.apple.com while a song plays, right-click the song
// title/artist in the player LCD -> Inspect, and update the selectors below.
const DOM_FALLBACK_SELECTORS = {
  title: [
    ".web-chrome-playback-lcd__song-name",
    "[data-testid='lcd-song-name']"
  ],
  artist: [
    ".web-chrome-playback-lcd__song-artist",
    "[data-testid='lcd-song-artist']"
  ],
  artwork: [
    ".web-chrome-playback-lcd__album-artwork img",
    ".web-chrome-playback-lcd img"
  ],
  playButton: [
    "button[aria-label='Play']",
    "button[aria-label='Pause']"
  ]
};

function queryFirst(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

function readFromMediaSession() {
  const ms = navigator.mediaSession;
  const meta = ms && ms.metadata;
  if (!meta || (!meta.title && !meta.artist)) return null;

  let artwork = null;
  if (meta.artwork && meta.artwork.length) {
    artwork = meta.artwork[meta.artwork.length - 1].src || null;
  }

  return {
    title: meta.title || null,
    artist: meta.artist || null,
    album: meta.album || null,
    artwork,
    isPlaying: ms.playbackState ? ms.playbackState === "playing" : null,
    source: "mediaSession"
  };
}

function readFromDom() {
  const titleEl = queryFirst(DOM_FALLBACK_SELECTORS.title);
  const artistEl = queryFirst(DOM_FALLBACK_SELECTORS.artist);
  if (!titleEl && !artistEl) return null;

  const artworkEl = queryFirst(DOM_FALLBACK_SELECTORS.artwork);
  const playButtonEl = queryFirst(DOM_FALLBACK_SELECTORS.playButton);

  return {
    title: titleEl ? titleEl.textContent.trim() : null,
    artist: artistEl ? artistEl.textContent.trim() : null,
    album: null,
    artwork: artworkEl ? artworkEl.src || artworkEl.currentSrc || null : null,
    isPlaying: playButtonEl
      ? playButtonEl.getAttribute("aria-label") === "Pause"
      : null,
    source: "dom"
  };
}

function scrape() {
  return readFromMediaSession() || readFromDom();
}

let lastPayload = null;

function tick() {
  const data = scrape();
  const payload = JSON.stringify(data);
  if (payload === lastPayload) return;
  lastPayload = payload;

  chrome.runtime.sendMessage({ type: "nowPlaying", data }).catch(() => {
    // Background service worker may be asleep momentarily; it will pick up
    // the next tick once it wakes.
  });
}

// Media Session updates don't reliably fire DOM mutation events, and
// play/pause state can change without any text changing, so a short poll
// interval is simpler and more robust than a MutationObserver here.
setInterval(tick, 1000);
tick();
