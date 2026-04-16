const audio = document.getElementById("audio");
const canvas = document.getElementById("vis");
const ctx = canvas.getContext("2d");

const now = document.getElementById("now");
const stationEl = document.getElementById("station");
const bg = document.getElementById("bg");

canvas.width = 800;
canvas.height = 120;

// =========================
// 3 STATIONS
// =========================
const stations = [
  {
    name: "Zaga Radio (Live)",
    url: "https://radio.zagatv.gr/radio.mp3"
  },
  {
    name: "Chillhop",
    url: "https://streams.ilovemusic.de/iloveradio16.mp3"
  },
	{
      name: "ZuccaRadio",
      url: "https://stream.zuccaradio.com/stream.mp3"
    }
];

let current = stations[0];

// =========================
// AUDIO VISUALISER
// =========================
let audioCtx;
let analyser;
let source;
let dataArray;

function initAudio() {

  if (audioCtx) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;

  source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  dataArray = new Uint8Array(analyser.frequencyBinCount);

  draw();
}

// =========================
// SPOTIFY STYLE VISUALISER
// =========================
function draw() {

  requestAnimationFrame(draw);

  if (!analyser) return;

  analyser.getByteFrequencyData(dataArray);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = 0;

  for (let i = 0; i < 60; i++) {

    const v = dataArray[i];
    const h = v / 1.3;

    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(x, 120 - h, 6, h);

    x += 12;
  }

  const avg = dataArray.reduce((a,b)=>a+b,0)/dataArray.length;
  bg.style.filter = `blur(${20 + avg/12}px) brightness(0.4)`;
}

// =========================
// PLAY STATION
// =========================
function playStation(s) {

  current = s;

  stationEl.textContent = s.name;

  audio.src = s.url;
  audio.load();

  audio.play().then(() => {

    initAudio();

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

  });

}

// =========================
// UI BUTTONS (AUTO)
// =================