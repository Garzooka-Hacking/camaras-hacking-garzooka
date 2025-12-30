const cameraData = [
  { slug: "brasil", name: "Av. Brasil", location: "Magdalena/Breña", m3u8: "https://live.smartechlatam.online/claro/brasilconjavierprado/index.m3u8" },
  { slug: "javierprado", name: "Av. Javier Prado Este", location: "San Isidro/Lince", m3u8: "https://live.smartechlatam.online/claro/javierprado/index.m3u8" },
  { slug: "angamos", name: "Av. Angamos Oeste", location: "Miraflores/Surquillo", m3u8: "https://live.smartechlatam.online/claro/angamos/index.m3u8" },
  { slug: "derby", name: "Av. El Derby", location: "Surco", m3u8: "https://live.smartechlatam.online/claro/derby/index.m3u8" },
  { slug: "panamericana", name: "Puente Atocongo", location: "Panamericana Sur", m3u8: "https://live.smartechlatam.online/claro/panamericana/index.m3u8" },
  { slug: "miraflores", name: "Av. Del Ejército", location: "Miraflores", m3u8: "https://live.smartechlatam.online/claro/miraflores/index.m3u8" },
  { slug: "surquillo", name: "Av. Rep. de Panamá", location: "Surquillo", m3u8: "https://live.smartechlatam.online/claro/republicapanama/index.m3u8" },
  { slug: "lince", name: "Av. Paseo de la Rep.", location: "Lince", m3u8: "https://live.smartechlatam.online/claro/lince/index.m3u8" },
  { slug: "ejercito", name: "Av. Del Ejército", location: "Magdalena", m3u8: "https://live.smartechlatam.online/claro/ejercito/index.m3u8" },
  { slug: "jesusmaria", name: "Av. Faustino Sanchez", location: "Jesús María", m3u8: "https://live.smartechlatam.online/claro/avfaustinocarrion/index.m3u8" },
  { slug: "lamarina", name: "Av. La Marina", location: "Pueblo Libre", m3u8: "https://live.smartechlatam.online/claro/lamarina/index.m3u8" },
  { slug: "rimac", name: "Av. Prol. Tacna", location: "Rímac", m3u8: "https://live.smartechlatam.online/claro/rimac/index.m3u8" },
  { slug: "kennedy", name: "Parque Kennedy", location: "Miraflores", m3u8: "https://hd-auth.skylinewebcams.com/live.m3u8?a=09q0osufd75jb9tgr9lpg3da32" }
];

function createCameraCard(camera, index) {
  const card = document.createElement('div');
  card.className = 'camera-card';
  card.id = `camera-${index}`;
  const isLarge = ["javierprado", "derby", "angamos"].includes(camera.slug);
  const xlClass = isLarge ? "xl-text" : "";

  card.innerHTML = `
    <div class="video-container">
      <div class="loading-overlay" id="loading-${index}">
        <div class="spinner"></div>
      </div>
      <video id="video-${index}" autoplay muted playsinline crossorigin="anonymous"></video>
      <div class="status-overlay ${xlClass}">
        <span class="glitch-text">NETWORK: GARZOOKA_SECURE_NODE_${index + 1}</span>
      </div>
      <div class="location-overlay ${xlClass}">
        <span>GZ_SURVEILLANCE_${camera.slug.toUpperCase()}</span>
      </div>
      <div class="brand-overlay ${xlClass}">
        <img src="logo.png" alt="GZ">
      </div>
    </div>
    <div class="camera-info">
      <div class="camera-details">
        <h3>${camera.name}</h3>
        <p>${camera.location}</p>
      </div>
      <div class="controls">
        <button class="btn-icon" onclick="toggleFullscreen('camera-${index}')" title="Pantalla Completa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
        <button class="btn-icon" onclick="refreshCamera(${index})" title="Recargar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6"></path>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
  return card;
}

function initHls(index) {
  const video = document.getElementById(`video-${index}`);
  const m3u8Url = cameraData[index].m3u8;
  const loading = document.getElementById(`loading-${index}`);

  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });
    hls.loadSource(m3u8Url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play();
      loading.style.display = 'none';
    });
    hls.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.error("Fatal network error encountered, trying to recover");
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error("Fatal media error encountered, trying to recover");
            hls.recoverMediaError();
            break;
          default:
            hls.destroy();
            break;
        }
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = m3u8Url;
    video.addEventListener('loadedmetadata', () => {
      video.play();
      loading.style.display = 'none';
    });
  }
}

function toggleFullscreen(elementId) {
  const element = document.getElementById(elementId);
  if (!document.fullscreenElement) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

function refreshCamera(index) {
  const loading = document.getElementById(`loading-${index}`);
  loading.style.display = 'flex';
  initHls(index);
}

// Initialize Grid
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('camera-grid');
  cameraData.forEach((camera, index) => {
    grid.appendChild(createCameraCard(camera, index));
    initHls(index);
  });
});
