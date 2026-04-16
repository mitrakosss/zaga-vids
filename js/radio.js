(() => {

// =========================
// 🎵 STATIONS
// =========================
const stations = [
  {
    name: "Zaga Radio",
    url: "https://radio.zagatv.gr/radio.mp3",
    logo: "img/zaga.png"
  },
  {
    name: "ZuccaRadio",
    url: "https://stream.zuccaradio.com/stream.mp3",
    logo: "img/zucca_radio.png"
  },
  {
    name: "LoFi Radio",
    url: "https://shorturl.at/KPUUR",
    logo: "img/lofi.png"
  }
];

// =========================
// 🎧 ELEMENTS
// =========================
const audio = document.getElementById("audio");
const grid = document.getElementById("radioGrid");

const stationName = document.getElementById("stationName");
const nowPlaying = document.getElementById("nowPlaying");

const cover = document.getElementById("cover");
const bg = document.getElementById("bg");

// =========================
// 🎛 STATE
// =========================
let currentIndex = 0;
let playing = false;

// =========================
// 🎨 SIMPLE SAFE VISUALISER (NO AUDIO BUGS)
// =========================
const canvas = document.getElementById("vis");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 100;

let bars = new Array(40).fill(5);

function draw() {

  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = 0;

  const target = playing ? 1 : 0;

  for (let i = 0; i < bars.length; i++) {

    const h = target
      ? Math.random() * 60 + 10
      : 3;

    bars[i] += (h - bars[i]) * 0.2;

    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00e5ff";
    ctx.fillStyle = "#00e5ff";

    ctx.fillRect(x, canvas.height - bars[i], 6, bars[i]);

    x += 12;
  }
}

draw();

// =========================
// ▶ PLAY (SAFE)
// =========================
function play(index) {

  const s = stations[index];
  currentIndex = index;

  stationName.textContent = s.name;
  nowPlaying.textContent = "LIVE";

  cover.src = s.logo;
  bg.style.backgroundImage = `url(${s.logo})`;

  audio.pause();
  audio.src = "";
  audio.load();

  setTimeout(() => {

    audio.src = s.url;

    audio.play()
      .then(() => {
        playing = true;
      })
      .catch(err => {
        console.log("PLAY ERROR:", err);
      });

  }, 100);
}

// =========================
// ⏯ STATE
// =========================
audio.onpause = () => playing = false;
audio.onended = () => playing = false;

// =========================
// 🧱 GRID
// =========================
stations.forEach((s, i) => {

  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <img src="${s.logo}">
    <div style="margin-top:5px;">${s.name}</div>
  `;

  div.onclick = () => play(i);

  grid.appendChild(div);

});

})();
