// No OSM raster requests, proxy, forged headers, or automatic provider hopping.
// OpenFreeMap explicitly offers a public vector service without registration.
export function setupBasemap(map, L, translate) {
  let layer,
    timer,
    generation = 0;
  const status = document.querySelector("#map-status");
  const text = document.querySelector("#map-message");
  const retry = document.querySelector("#retry-map");
  let message = "Loading map…";
  function show(value, canRetry = false) {
    message = value;
    status.hidden = false;
    text.textContent = translate(value);
    retry.hidden = !canRetry;
  }
  function refresh() {
    text.textContent = translate(message);
  }
  window.addEventListener("dotheading:language", refresh);
  map.attributionControl.addAttribution(
    '<a href="https://openfreemap.org/" target="_blank" rel="noopener">OpenFreeMap</a> · <a href="https://openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> · © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  );
  async function start() {
    const current = ++generation;
    clearTimeout(timer);
    if (layer) {
      map.removeLayer(layer);
      layer = null;
    }
    show("Loading map…");
    function failed() {
      if (current !== generation) return;
      generation++;
      clearTimeout(timer);
      if (layer) {
        map.removeLayer(layer);
        layer = null;
      }
      show(
        "Map unavailable. Check your connection or WebGL support. Saved trips still work.",
        true,
      );
    }
    timer = setTimeout(failed, 20000);
    try {
      // Reject unsupported devices before registering a partially initialized Leaflet layer.
      const probe = document.createElement("canvas");
      const context = probe.getContext("webgl2");
      if (!context) {
        failed();
        return;
      }
      context.getExtension("WEBGL_lose_context")?.loseContext();
      const { maplibreGL } = await import("./vector.js");
      if (current !== generation) return;
      layer = maplibreGL({
        style: "https://tiles.openfreemap.org/styles/positron",
        attributionControl: false,
      }).addTo(map);
      const gl = layer.getMaplibreMap();
      gl.on("error", failed);
      gl.once("idle", () => {
        if (current !== generation) return;
        clearTimeout(timer);
        status.hidden = true;
      });
      gl.on("webglcontextlost", failed);
    } catch {
      failed();
    }
  }
  retry.onclick = start;
  start();
}
