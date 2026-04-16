(() => {

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
      name: "LoFi Radio",
      url: "https://shorturl.at/KPUUR"
    }
  ];

  const grid = document.getElementById("radioGrid");
  const audio = document.getElementById("audio");
  const stationName = document.getElementById("stationName");
  const canvas = document.getElementById("vis");
  const ctx = canvas.getContext("2d");

  const now = document.getElementById("nowPlaying");

  canvas.width = 800;
  canvas.height = 100;

  let audioCtx;
  let analyser;
  let source;
  let dataArray;

  // =========================
  // VISUALISER (SPOTIFY STYLE)
  // =========================
  function initAudioGraph() {

    if (audioCtx) return;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    dataArray = new Uint8Array(analyser.frequencyBinCount);

    draw();
  }

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
  // PLAY STATION
  // =========================
  function play(s) {

    stationName.textContent = s.name;
    now.textContent = "Live";

    audio.src = s.url;
    audio.load();

    audio.play().then(() => {

      initAudioGraph();

      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

    });

  }

  // =========================
  // RENDER GRID
  // =========================
  stations.forEach(s => {

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>📻 ${s.name}</b>
      <div style="opacity:0.6;font-size:12px;margin-top:6px;">Click to play</div>
    `;

    div.onclick = () => play(s);

    grid.appendChild(div);

  });

})();