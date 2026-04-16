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

const audio = document.getElementById("audio");
const grid = document.getElementById("radioGrid");
const stationName = document.getElementById("stationName");
const nowPlaying = document.getElementById("nowPlaying");
const cover = document.getElementById("cover");
const bg = document.getElementById("bg");

const canvas = document.getElementById("vis");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 100;

let bars = new Array(40).fill(10);
let phase = 0;
let energy = 0;
let playing = false;

/* VISUALISER */
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

/* PLAY */
function play(s) {

  stationName.textContent = s.name;
  nowPlaying.textContent = "LIVE";

  cover.src = s.logo;
  bg.style.backgroundImage = `url(${s.logo})`;

  audio.pause();
  audio.src = "";
  audio.load();

  setTimeout(() => {
    audio.src = s.url;

    audio.play().then(() => {
      playing = true;
    });

  }, 100);
}

audio.onpause = () => playing = false;
audio.onended = () => playing = false;

/* GRID */
stations.forEach(s => {

  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <img src="${s.logo}">
    <div style="margin-top:5px;">${s.name}</div>
  `;

  div.onclick = () => play(s);

  grid.appendChild(div);

});

})();
