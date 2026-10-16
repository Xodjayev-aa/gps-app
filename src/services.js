import { t } from "./i18n.js";
let lastSearch = 0;
const cache = new Map();
async function json(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok)
    throw new Error(
      t("Community service unavailable ({status}). Try again later.", {
        status: response.status,
      }),
    );
  return response.json();
}
// One search at a time, at least 1.1 seconds apart. No autocomplete or background searches.
let queue = Promise.resolve();
export function geocode(query) {
  const q = query.trim();
  if (cache.has(q)) return Promise.resolve(cache.get(q));
  const task = queue.then(async () => {
    await new Promise((r) =>
      setTimeout(r, Math.max(0, 1100 - (Date.now() - lastSearch))),
    );
    lastSearch = Date.now();
    const data = await json(
      `https://nominatim.openstreetmap.org/search?${new URLSearchParams({ q, format: "json", limit: "1" })}`,
    );
    if (!data.length)
      throw new Error(
        t("No place found for “{query}”. Try a full address.", { query: q }),
      );
    const p = {
      lat: Number(data[0].lat),
      lng: Number(data[0].lon),
      name: data[0].display_name,
    };
    cache.set(q, p);
    return p;
  });
  queue = task.catch(() => {});
  return task;
}
export async function route(points) {
  const coordinates = points.map((p) => `${p.lng},${p.lat}`).join(";");
  const data = await json(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`,
  );
  if (data.code !== "Ok" || !data.routes?.length)
    throw new Error(t("No driving route found."));
  const r = data.routes[0];
  return {
    duration: r.duration * 1000,
    distance: r.distance,
    path: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
  };
}
