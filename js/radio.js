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

  const grid = document.getElementById("radioGrid");
  const audio = document.getElementById("audio");
  const stationName = document.getElementById("stationName");
  const nowPlaying = document.getElementById("nowPlaying");

  const canvas = document.getElementById("vis");
  const ctx = canvas.getContext("2d");

  canvas.width = 800;
  canvas.height = 100;

  let playing = false;

  // =========================
  // FAKE VISUALISER (SMOOTH)
  // =========================
const BAR_COUNT = 40;
const GROUP_SIZE = 4;

let bars = new Array(BAR_COUNT).fill(10);
let phase = 0;
let energy = 0;

function draw() {

  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // energy ανεβαίνει όταν παίζει
  const targetEnergy = playing ? 1 : 0;
  energy += (targetEnergy - energy) * 0.05;

  let x = 0;

  for (let i = 0; i < BAR_COUNT; i++) {

    // GROUPED BARS (Spotify style)
    const groupIndex = Math.floor(i / GROUP_SIZE);

    // waveform βάση (ημιτονοειδές)
    const wave =
      Math.sin((i * 0.4) + phase) * 0.5 +
      Math.sin((i * 0.2) - phase * 1.2) * 0.5;

    // beat pulse (slow)
    const beat = Math.abs(Math.sin(phase * 0.6));

    // τελικό target ύψος
    let target =
      20 +
      wave * 25 * energy +
      beat * 30 * energy;

    // smooth interpolation
    bars[i] += (target - bars[i]) * 0.15;

    // 🔥 GLOW EFFECT
    const glow = ctx.createLinearGradient(0, 0, 0, canvas.height);
    glow.addColorStop(0, "#00e5ff");
    glow.addColorStop(1, "#0088ff");

    ctx.shadowBlur = 15;
    ctx.shadowColor = "#00e5ff";
    ctx.fillStyle = glow;

    ctx.fillRect(x, canvas.height - bars[i], 6, bars[i]);

    x += 12;
  }

  // advance animation
  phase += 0.05 + energy * 0.05;
}

draw();
  // =========================
  // PLAY
  // =========================
  function play(s) {

    stationName.textContent = s.name;
    nowPlaying.textContent = "Live";

    audio.pause();
    audio.src = "";
    audio.load();

    setTimeout(() => {
      audio.src = s.url;

      audio.play()
        .then(() => {
          playing = true;
        })
        .catch(err => console.log(err));

    }, 100);
  }

  audio.onpause = () => playing = false;
  audio.onended = () => playing = false;

  // =========================
  // UI
  // =========================
  stations.forEach(s => {

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div class="card-inner">
        <img src="${s.logo}" />
        <div>
          <div><b>📻 ${s.name}</b></div>
          <div style="opacity:0.6;font-size:12px;">Click to play</div>
        </div>
      </div>
    `;

    div.onclick = () => play(s);

    grid.appendChild(div);

  });

})();
