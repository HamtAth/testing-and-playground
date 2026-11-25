const FALLBACK = [50.0875, 14.4213]; // Prague, used until a location is known
const PAN_STEP = 160; // px

const map = L.map('map', { zoomControl: false }).setView(FALLBACK, 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Pin
const pin = L.marker(FALLBACK, {
  title: 'Click me',
  alt: 'Location pin',
  icon: L.divIcon({
    className: 'pin-icon',
    iconSize: [36, 48],
    iconAnchor: [18, 48],
    html: `<svg class="pin" viewBox="0 0 36 48" aria-hidden="true">
      <path fill="#d6336c" d="M18 48C18 48 36 29 36 18A18 18 0 0 0 0 18C0 29 18 48 18 48Z"/>
      <circle cx="18" cy="18" r="7" fill="#fff"/></svg>`,
  }),
}).addTo(map);

const pinElement = pin.getElement();
const pinShape = pinElement.querySelector('.pin');
pinElement.setAttribute('aria-label', 'Location pin, activate to send a wave');

function celebrate() {
  // Restart the jump even if it is already running
  pinShape.classList.remove('jump');
  void pinShape.getBoundingClientRect();
  pinShape.classList.add('jump');

  const wave = document.createElement('span');
  wave.className = 'wave';
  wave.addEventListener('animationend', () => wave.remove());
  pinElement.prepend(wave); // behind the pin
}

pin.on('click', celebrate);
pinElement.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  if (!event.repeat) celebrate();
});

// Controls
const zoomIn = document.getElementById('zoom-in');
const zoomOut = document.getElementById('zoom-out');
zoomIn.addEventListener('click', () => map.zoomIn());
zoomOut.addEventListener('click', () => map.zoomOut());
map.on('zoomend', () => {
  zoomIn.disabled = map.getZoom() >= map.getMaxZoom();
  zoomOut.disabled = map.getZoom() <= map.getMinZoom();
});

document.querySelectorAll('[data-pan]').forEach((button) => {
  const [x, y] = button.dataset.pan.split(',').map(Number);
  button.addEventListener('click', () => map.panBy([x * PAN_STEP, y * PAN_STEP]));
});

// Location
const status = document.getElementById('status');
let watchId = null;
let recenter = false;
let located = false;

function locate() {
  recenter = true;
  if (!navigator.geolocation) {
    status.textContent = 'This browser does not support location.';
    return;
  }
  if (located) {
    map.setView(pin.getLatLng(), Math.max(map.getZoom(), 16));
    recenter = false;
    return;
  }
  status.textContent = 'Finding your location…';
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = navigator.geolocation.watchPosition(onPosition, onLocationError, {
    enableHighAccuracy: true,
    timeout: 15000,
  });
}

function onPosition({ coords }) {
  located = true;
  status.textContent = '';
  pin.setLatLng([coords.latitude, coords.longitude]);
  if (recenter) {
    map.setView(pin.getLatLng(), 16);
    recenter = false;
  }
}

function onLocationError(error) {
  if (located) return; // keep the last known position
  status.textContent = error.code === error.PERMISSION_DENIED
    ? 'Location is blocked, so the pin is in Prague. Allow location, then press ◎.'
    : 'Could not find your location, so the pin is in Prague. Press ◎ to retry.';
}

document.getElementById('locate').addEventListener('click', locate);
locate();
