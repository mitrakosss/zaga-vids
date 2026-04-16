(() => {

  const stations = [
    {
      name: "Zaga Radio (Live)",
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
let bars = new Array(50).fill(5);

function draw() {

  requestAnimationFrame(draw);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let x = 0;

  // παίρνουμε volume από audio
  const volume = audio.paused ? 0 : (audio.volume || 1);

  for (let i = 0; i < bars.length; i++) {

    // smooth target height (όχι random spam)
    let target = playing
      ? (Math.random() * 50 + 10) * volume
      : 5;

    // smooth transition (key fix)
    bars[i] += (target - bars[i]) * 0.1;

    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(x, canvas.height - bars[i], 6, bars[i]);

    x += 14;
  }
}
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
