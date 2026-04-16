(() => {

  const stations = [
    {
      name: "Zaga Radio (Live)",
      url: "https://radio.zagatv.gr/radio.mp3",
      logo: "img/zaga.png"
    },
    {
      name: "Chillhop",
      url: "https://streams.ilovemusic.de/iloveradio16.mp3",
      logo: "img/chillhop.png"
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

  let audioCtx = null;
  let analyser = null;
  let source = null;
  let dataArray = null;

  // =========================
  // CREATE AUDIO GRAPH (SAFE)
  // =========================
  function ensureAudioGraph() {

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

  // =========================
  // VISUALISER
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
      ctx.fillRect(x, canvas.height - h, 5, h);

      x += 12;
    }
  }

  // =========================
  // 🔥 FIXED PLAY (MOST IMPORTANT PART)
  // =========================
  function play(s) {

    stationName.textContent = s.name;
    nowPlaying.textContent = "Live";

    // IMPORTANT: STOP old stream cleanly
    audio.pause();
    audio.removeAttribute("src");
    audio.load();

    // small delay avoids Chrome audio bug
    setTimeout(() => {

      audio.src = s.url;

      const p = audio.play();

      if (p !== undefined) {
        p.then(() => {

          // ONLY INIT AFTER CONFIRMED PLAY
          ensureAudioGraph();

          if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
          }

        }).catch(err => {
          console.log("PLAY BLOCKED:", err);
        });
      }

    }, 150);

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
