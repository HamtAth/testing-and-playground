# Map Wave

A one-page map that shows your current location. Click the pin: it jumps and sends out a wave.

Run locally (geolocation needs `localhost` or HTTPS):

```bash
python3 -m http.server 8123
```

Then open http://localhost:8123. There is no build step, so GitHub Pages can serve the repo root as is.

Map: [Leaflet](https://leafletjs.com) with [OpenStreetMap](https://www.openstreetmap.org/copyright) tiles.
