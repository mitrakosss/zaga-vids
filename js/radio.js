(() => {
  const stations = [
    {
      name: "LoFi Radio",
      url: "https://streams.ilovemusic.de/iloveradio17.mp3"
    },
    {
      name: "BBC World Service",
      url: "https://stream.live.vc.bbcmedia.co.uk/bbc_world_service"
    },
    {
      name: "Classical Radio",
      url: "https://ice1.somafm.com/groovesalad-128-mp3"
    },
    {
      name: "Chillhop",
      url: "https://streams.ilovemusic.de/iloveradio16.mp3"
    }
  ];

  const grid = document.getElementById("radioGrid");
  const audio = document.getElementById("audioPlayer");
  const title = document.getElementById("stationName");

  function playStation(station) {
    title.textContent = station.name;
    audio.src = station.url;
    audio.play().catch(() => {});
  }

  function renderStations() {
    grid.innerHTML = "";

    stations.forEach(station => {
      const card = document.createElement("div");
      card.className = "video-container"; // reuse same style

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
