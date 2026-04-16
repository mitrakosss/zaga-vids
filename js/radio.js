(() => {

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

// ELEMENTS
const audio = document.getElementById("audio");
const grid = document.getElementById("radioGrid");
const stationName = document.getElementById("stationName");
const nowPlaying = document.getElementById("nowPlaying");
const cover = document.getElementById("cover");
const bg = document.getElementById("bg");

const miniCover = document.getElementById("miniCover");
const miniTitle = document.getElementById("miniTitle");
const miniNow = document.getElementById("miniNow");

const progressBar = document.getElementById("progressBar");

const canvas = document.getElementById("vis");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 100;

// STATE
let bars = new Array(40).fill(10);
let phase = 0;
let energy = 0;
let playing = false;
let currentIndex = 0;

// =========================
// 🎧 VISUALISER (PRO)
// =========================
function draw() {

  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const targetEnergy = playing ? 1 : 0;
  energy += (targetEnergy - energy) * 0.05;

  let x = 0;

  for (let i = 0; i < bars.length; i++) {

    const wave =
      Math.sin(i * 0.4 + phase) +
      Math.sin(i * 0.2 - phase);

    const beat = Math.abs(Math.sin(phase * 0.6));

    let target = 20 + wave * 15 * energy + beat * 25 * energy;

    bars[i] += (target - bars[i]) * 0.15;

    ctx.shadowBlur = 20;
    ctx.shadowColor = "#00e5ff";

    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(x, canvas.height - bars[i], 6, bars[i]);

    x += 12;
  }

  phase += 0.05 + energy * 0.05;
}

draw();

// =========================
// ▶ PLAY
// =========================
function play(index) {

  const s = stations[index];
  currentIndex = index;

  stationName.textContent = s.name;
  nowPlaying.textContent = "LIVE";

  cover.src = s.logo;
  bg.style.backgroundImage = `url(${s.logo})`;

  miniCover.src = s.logo;
  miniTitle.textContent = s.name;

  audio.pause();
  audio.src = "";
  audio.load();

  setTimeout(() => {

    audio.src = s.url;

    audio.play()
      .then(() => {
        playing = true;
        progress = 0;
      })
      .catch(err => console.log(err));

  }, 100);
}

audio.onpause = () => playing = false;
audio.onended = () => playing = false;

// =========================
// 🎵 ICECAST METADATA
// =========================
async function fetchMetadata() {
  try {
    const res = await fetch("https://radio.zagatv.gr/status-json.xsl");
    const data = await res.json();

    let source = data.icestats.source;
    let title = "Live";

    if (Array.isArray(source)) {
      title = source[0].title || "Live";
    } else {
      title = source.title || "Live";
    }

    nowPlaying.textContent = title;
    miniNow.textContent = title;

  } catch (e) {
    nowPlaying.textContent = "Live";
  }
}

setInterval(fetchMetadata, 10000);

// =========================
// ⏱ PROGRESS BAR (FAKE)
// =========================
let progress = 0;

function animateProgress() {

  if (playing) {
    progress += 0.25;

    if (progress > 100) progress = 0;

    progressBar.style.width = progress + "%";
  }

  requestAnimationFrame(animateProgress);
}

animateProgress();

// =========================
// 👉 SWIPE MOBILE
// =========================
let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {

  let endX = e.changedTouches[0].clientX;
  let diff = endX - startX;

  if (diff > 50) {
    // previous
    let prev = (currentIndex - 1 + stations.length) % stations.length;
    play(prev);
  }

  if (diff < -50) {
    // next
    let next = (currentIndex + 1) % stations.length;
    play(next);
  }

});

// =========================
// GRID UI
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
