(() => {
  const stations = [
    {
      name: "Zaga Radio (My Icecast)",
      url: "https://radio.zagatv.gr/radio.mp3"
    },
    {
      name: "LoFi Radio",
      url: "https://shorturl.at/KPUUR"
    },
    {
      name: "ZuccaRadio",
      url: "https://stream.zuccaradio.com/stream?"
    }
  ];

  const grid = document.getElementById("radioGrid");
  const audio = document.getElementById("audioPlayer");
  const title = document.getElementById("stationName");

  // =========================
  // 🎧 AUDIO VISUALISER SETUP
  // =========================
  const canvas = document.createElement("canvas");
  canvas.id = "visualiser";
  canvas.width = 600;
  canvas.height = 120;
  canvas.style.width = "100%";
  canvas.style.maxWidth = "600px";
  canvas.style.display = "block";
  canvas.style.margin = "10px auto";

  const playerBox = document.getElementById("playerBox");
  playerBox.insertBefore(canvas, audio);

  const ctx = canvas.getContext("2d");

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContext();

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;

  const source = audioCtx.createMediaElementSource(audio);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 1.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];

      ctx.fillStyle = "rgba(0, 200, 255, 0.8)";
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  draw();

  // =========================
  // 🎵 RADIO LOGIC
  // =========================
  function playStation(station) {
    title.textContent = station.name;
    audio.src = station.url;

    audio.play().then(() => {
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
    }).catch(() => {});
  }

  function renderStations() {
    grid.innerHTML = "";

    stations.forEach(station => {
      const card = document.createElement("div");
      card.className = "video-container";

      card.innerHTML = `
        <div class="overlay" style="opacity:1; position:relative;">
          <div class="title">📻 ${station.name}</div>
          <div class="date">Click to play</div>
        </div>
      `;

      card.addEventListener("click", () => playStation(station));

      grid.appendChild(card);
    });
  }

  renderStations();
})();