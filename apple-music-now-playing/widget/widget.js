const WS_URL = `ws://${location.hostname || "localhost"}:8787`;

const card = document.getElementById("card");
const artworkWrap = document.querySelector(".artwork");
const artworkImg = document.getElementById("artwork-img");
const titleEl = document.getElementById("title");
const artistEl = document.getElementById("artist");
const eqEl = document.getElementById("eq");

let hideTimer = null;

function render(data) {
  clearTimeout(hideTimer);

  if (!data || (!data.title && !data.artist)) {
    card.classList.remove("is-visible");
    return;
  }

  titleEl.textContent = data.title || "";
  artistEl.textContent = data.artist || "";

  if (data.artwork) {
    artworkImg.src = data.artwork;
    artworkWrap.classList.add("has-image");
  } else {
    artworkImg.removeAttribute("src");
    artworkWrap.classList.remove("has-image");
  }

  eqEl.classList.toggle("is-playing", data.isPlaying !== false);
  card.classList.add("is-visible");
}

function connect() {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.role === "state") render(message.data);
    } catch {
      // Ignore malformed messages.
    }
  };

  ws.onclose = () => {
    card.classList.remove("is-visible");
    setTimeout(connect, 2000);
  };

  ws.onerror = () => ws.close();
}

connect();
