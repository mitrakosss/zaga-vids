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

  function play(s) {

    stationName.textContent = s.name;
    nowPlaying.textContent = "Live";

    audio.pause();
    audio.src = "";
    audio.load();

    setTimeout(() => {
      audio.src = s.url;
      audio.play().catch(err => console.log(err));
    }, 100);
  }

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
