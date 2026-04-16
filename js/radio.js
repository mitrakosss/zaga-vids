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

  let audioCtx;
  let analyser;
  let source;
  let dataArray;
  let started = false;

  // =========================
  // INIT AUDIO GRAPH (IMPORTANT FIX)
  // =========================
  function initAudio() {

    if (started) return;
    started = true;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    draw();
  }

  // =========================
  // VISUALISER
  // =========================
  function draw() {

    requestAnimationFrame(draw);

    if (!analyser) return;

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = 0;

    for (let i = 0; i < 50; i++) {

      const v = dataArray[i];
      const h = v / 1.4;

      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(x, canvas.height - h, 6, h);

      x += 14;
    }
  }

  // =========================
  // PLAY FIX (IMPORTANT)
  // =========================
  function play(s) {

  stationName.textContent = s.name;
  nowPlaying.textContent = "Live";

  // ⚠️ reset audio properly
  audio.pause();
  audio.src = "";
  audio.load();

  setTimeout(() => {

    audio.src = s.url;

    audio.play().then(() => {

      if (!started) initAudio();

      if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
      }

    }).catch(err => {
      console.log("Audio play failed:", err);
    });

  }, 50);

}

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