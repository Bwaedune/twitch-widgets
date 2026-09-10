// Local-only relay: serves the widget page over HTTP and relays now-playing
// updates from the browser extension to any connected widget pages over
// WebSocket. Everything binds to 127.0.0.1 -- nothing here is reachable
// outside this machine.
const http = require("http");
const fs = require("fs");
const path = require("path");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8787;
const WIDGET_DIR = path.join(__dirname, "..", "widget");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript"
};

let latestData = null;

const httpServer = http.createServer((req, res) => {
  const requestPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(WIDGET_DIR, requestPath);

  if (!filePath.startsWith(WIDGET_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "text/plain" });
    res.end(content);
  });
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  // Bring new widget clients up to date immediately instead of making them
  // wait for the next song change.
  if (latestData !== null) {
    ws.send(JSON.stringify({ role: "state", data: latestData }));
  }

  ws.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw);
    } catch {
      return;
    }
    if (message.role !== "source") return;

    latestData = message.data;
    const outgoing = JSON.stringify({ role: "state", data: latestData });
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) client.send(outgoing);
    }
  });
});

httpServer.listen(PORT, "127.0.0.1", () => {
  console.log(`Apple Music widget server running at http://localhost:${PORT}`);
  console.log("Add this URL as an OBS Browser Source.");
});
