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
      logo: "img/zucca_radio.mp3"
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
  function draw() {

    requestAnimationFrame(draw);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let x = 0;

    for (let i = 0; i < 50; i++) {

      // random αλλά smooth
      const h = playing
        ? Math.random() * 80 + 10
        : 5;

      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(x, canvas.height - h, 6, h);

      x += 14;
    }
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
