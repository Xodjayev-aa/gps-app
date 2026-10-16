export function distance(a, b) {
  const r = Math.PI / 180,
    dlat = (b.lat - a.lat) * r,
    dlng = (b.lng - a.lng) * r;
  const h =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dlng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
export const formatTime = (ms) =>
  `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}`;
export const escapeHTML = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(`wio:${key}`));
    return v ?? fallback;
  } catch {
    return fallback;
  }
}
export function save(key, value) {
  try {
    localStorage.setItem(`wio:${key}`, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
export const validPoint = (p) =>
  p &&
  Number.isFinite(p.lat) &&
  Number.isFinite(p.lng) &&
  Math.abs(p.lat) <= 90 &&
  Math.abs(p.lng) <= 180;
export function validTrip(t) {
  return (
    t &&
    typeof t.name === "string" &&
    Number.isFinite(t.start) &&
    Number.isFinite(t.dur) &&
    t.dur >= 0 &&
    Number.isFinite(t.dist) &&
    t.dist >= 0
  );
}
export function validateBackup(data) {
  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.trips) ||
    data.trips.length > 50 ||
    !data.trips.every(
      (t) => validTrip(t) && t.name.length <= 120 && typeof t.mode === "string",
    )
  )
    throw new Error("Invalid trip backup (maximum 50 trips).");
  const errands = data.errands ?? [];
  if (
    !Array.isArray(errands) ||
    errands.length > 10 ||
    !errands.every(
      (e) =>
        e &&
        typeof e.name === "string" &&
        e.name.length <= 120 &&
        typeof e.place === "string" &&
        e.place.length <= 200,
    )
  )
    throw new Error("Invalid errands in backup.");
  return {
    trips: data.trips.map((t) => ({
      name: t.name,
      start: t.start,
      dur: t.dur,
      dist: t.dist,
      mode: t.mode,
    })),
    ...validateLibrary(data),
    errands: errands.map((e) => ({
      name: e.name,
      place: e.place,
      pick: false,
    })),
  };
}
export function validateLibrary(data) {
  const destinations = data.destinations ?? [],
    templates = data.templates ?? [];
  const text = (s, max) =>
    typeof s === "string" && s.trim().length > 0 && s.length <= max;
  if (
    !Array.isArray(destinations) ||
    destinations.length > 20 ||
    !destinations.every((p) => p && text(p.name, 80) && text(p.address, 200))
  )
    throw new Error("Invalid saved destinations.");
  if (
    !Array.isArray(templates) ||
    templates.length > 20 ||
    !templates.every(
      (p) =>
        p &&
        text(p.name, 80) &&
        Array.isArray(p.tasks) &&
        p.tasks.length > 0 &&
        p.tasks.length <= 10 &&
        p.tasks.every((e) => e && text(e.name, 120) && text(e.place, 200)),
    )
  )
    throw new Error("Invalid errand templates.");
  return {
    destinations: destinations.map(({ name, address }) => ({ name, address })),
    templates: templates.map(({ name, tasks }) => ({
      name,
      tasks: tasks.map(({ name, place }) => ({ name, place })),
    })),
  };
}
