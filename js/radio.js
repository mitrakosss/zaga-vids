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

const miniCover = document.getElementById("miniCover");
const miniTitle = document.getElementById("miniTitle");
const miniNow = document.getElementById("miniNow");

const progressBar = document.getElementById("progressBar");

const canvas = document.getElementById("vis");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 100;

// =========================
// 🎛 STATE
// =========================
let currentIndex = 0;
let playing = false;

// =========================
// 📊 VISUALISER STATE
// =========================
let audioCtx = null;
let analyser = null;
let source = null;
let dataArray = null;
let initialized = false;

// =========================
// 🔥 INIT AUDIO ANALYSER
// =========================
function initAudio() {

  if (initialized) return;

  try {

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;

    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    initialized = true;

  } catch (e) {
    console.log("Audio init error:", e);
  }
}

// =========================
// 🎨 VISUALISER
// =========================
function draw() {

  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {

    const v = dataArray[i];
    const h = v * 0.6;

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00e5ff";

    ctx.fillStyle = "#00e5ff";

    ctx.fillRect(x, canvas.height - h, 5, h);

    x += 6;
  }
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

        initAudio();

        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume();
        }

      })
      .catch(err => console.log(err));

  }, 100);
}

// =========================
// ⏯ AUDIO STATE
// =========================
audio.onpause = () => playing = false;
audio.onended = () => playing = false;

// =========================
// ⏱ FAKE PROGRESS
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
// 📱 SWIPE
// =========================
let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {

  const diff = e.changedTouches[0].clientX - startX;

  if (diff > 50) {
    const prev = (currentIndex - 1 + stations.length) % stations.length;
    play(prev);
  }

  if (diff < -50) {
    const next = (currentIndex + 1) % stations.length;
    play(next);
  }

});

// =========================
// 🧱 GRID UI
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
