// Relays now-playing messages from the content script to the local widget
// server over WebSocket. Runs as an MV3 service worker, so it may be put to
// sleep between messages -- the socket is reconnected lazily on demand
// rather than kept alive continuously.
const SERVER_URL = "ws://localhost:8787";

let socket = null;
let connecting = null;

function ensureSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return Promise.resolve(socket);
  }
  if (connecting) return connecting;

  connecting = new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL);
    ws.onopen = () => {
      socket = ws;
      connecting = null;
      resolve(ws);
    };
    ws.onerror = () => {
      connecting = null;
      reject(new Error("Could not reach widget server at " + SERVER_URL));
    };
    ws.onclose = () => {
      if (socket === ws) socket = null;
    };
  });

  return connecting;
}

chrome.runtime.onMessage.addListener((message) => {
  if (!message || message.type !== "nowPlaying") return;

  ensureSocket()
    .then((ws) => {
      ws.send(JSON.stringify({ role: "source", data: message.data }));
    })
    .catch(() => {
      // Widget server isn't running -- nothing to do until the next update.
    });
});
