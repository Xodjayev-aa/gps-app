import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
// Bundle the worker as well as the renderer: do not leave a runtime node_modules URL.
setWorkerUrl(workerUrl);
export { maplibreGL };
