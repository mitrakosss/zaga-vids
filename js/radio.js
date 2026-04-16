(() => {

// =========================
// STATIONS
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
// ELEMENTS
// =========================
const audio = document.getElementById("audio");
const grid = document.getElementById("radioGrid");

const stationName = document.getElementById("stationName");
const nowPlaying = document.getElementById("nowPlaying");

const cover = document.getElementById("cover");
const bg = document.getElementById("bg");

const playBtn = document.getElementById("playBtn");

const canvas = document.getElementById("vis");
const ctx = canvas.getContext("2d");

const progressBar = document.getElementById("progressBar");

canvas.width = 600;
canvas.height = 100;

// =========================
// STATE
// =========================
let currentIndex = 0;
let playing = false;
let progress = 0;

// =========================
// VISUALISER (SMOOTH + CENTERED)
// =========================
let bars = new Array(40).fill(5);

function draw() {

  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const center = canvas.width / 2;

  let x = 0;

  for (let i = 0; i < bars.length; i++) {

    const wave =
      Math.sin(i * 0.3 + performance.now() * 0.002) * 10;

    const target = playing ? 20 + wave : 3;

    bars[i] += (target - bars[i]) * 0.1;

    const drawX = center + (i - bars.length / 2) * 10;

    ctx.shadowBlur = 12;
    ctx.shadowColor = "#00e5ff";
    ctx.fillStyle = "#00e5ff";

    ctx.fillRect(drawX, canvas.height / 2 - bars[i] / 2, 6, bars[i]);
  }
}

draw();

// =========================
// PLAY
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
        playBtn.textContent = "❚❚";
      })
      .catch(console.log);

  }, 100);
}

// =========================
// BUTTON
// =========================
playBtn.onclick = () => {

  if (audio.paused) {
    audio.play();
    playing = true;
    playBtn.textContent = "❚❚";
  } else {
    audio.pause();
    playing = false;
    playBtn.textContent = "▶";
  }

};

// =========================
// STATE EVENTS
// =========================
audio.onpause = () => {
  playing = false;
  playBtn.textContent = "▶";
};

audio.onended = () => {
  playing = false;
  playBtn.textContent = "▶";
};

// =========================
// PROGRESS (FAKE SPOTIFY)
// =========================
function animateProgress() {

  if (playing) {
    progress += 0.2;
    if (progress > 100) progress = 0;
    progressBar.style.width = progress + "%";
  }

  requestAnimationFrame(animateProgress);
}

animateProgress();

// =========================
// GRID
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
