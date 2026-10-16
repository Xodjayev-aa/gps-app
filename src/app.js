import L from "leaflet";
import { setupBasemap } from "./basemap.js";
import { t, setupLanguage, language } from "./i18n.js";
import { setupLibrary } from "./library.js";
import { setupInstall } from "./pwa.js";
import { setupAccounts, LEGAL_VERSION } from "./accounts.js";
import "./app.css";
import {
  distance,
  formatTime,
  escapeHTML as esc,
  load,
  save,
  validPoint,
  validTrip,
  validateBackup,
} from "./core.js";
import { geocode, route } from "./services.js";
setupLanguage();
const $ = (s) => document.querySelector(s);
let statusMessage =
    "Free community maps · driving routes only · keep this page open while recording.",
  statusValues = {};
function setStatus(message, values = {}) {
  statusMessage = message;
  statusValues = values;
  $("#service-status").textContent = t(message, values);
}
const modes = {
  WALKING: "On foot",
  BICYCLING: "Bike",
  TWO_WHEELER: "Scooter",
  DRIVING: "Car",
};
let consent = load("consent", null),
  trips = load("trips", []),
  errands = load("errands", []);
trips = Array.isArray(trips) ? trips.filter(validTrip).slice(0, 50) : [];
errands = Array.isArray(errands)
  ? errands
      .filter(
        (e) => e && typeof e.name === "string" && typeof e.place === "string",
      )
      .slice(0, 10)
  : [];
let fix = null,
  trip = null,
  watch = null,
  follow = true,
  destination = null,
  busy = false;
const map = L.map("map", { zoomControl: true }).setView([41.3111, 69.2797], 12);
setupBasemap(map, L, t);
const markers = L.layerGroup().addTo(map),
  routeLine = L.polyline([], { color: "#2f6fed", weight: 5 }).addTo(map);
let car = null;
map.on("dragstart", () => (follow = false));
function toast(message) {
  $("#toast").textContent = t(message);
  $("#toast").classList.add("on");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => $("#toast").classList.remove("on"), 5000);
}
function persist(key, value) {
  if (!save(key, value)) {
    toast(
      "Browser storage is unavailable or full. Changes are only in memory; export trips before leaving.",
    );
    return false;
  }
  return true;
}
function mode() {
  return $("#modeSel").value === "auto"
    ? fix?.speed < 2.5
      ? "WALKING"
      : fix?.speed < 7
        ? "BICYCLING"
        : "DRIVING"
    : $("#modeSel").value;
}
function tLabel(mode) {
  return t(modes[mode] || "Trip");
}
function render() {
  $("#trip-stats").textContent = t(
    "{count} saved trips · {distance} km total · {time} recorded",
    {
      count: trips.length,
      distance: (trips.reduce((sum, t) => sum + t.dist, 0) / 1000).toFixed(2),
      time: formatTime(trips.reduce((sum, t) => sum + t.dur, 0)),
    },
  );

  $("#list").innerHTML = errands.length
    ? errands
        .map(
          (e, i) =>
            `<li><input aria-label="${esc(t("Include"))} ${esc(e.name)}" type="checkbox" data-pick="${i}" ${e.pick ? "checked" : ""} ${e.delta == null ? "disabled" : ""}><div class="t"><b>${esc(e.name)}</b><small>${esc(e.place)}</small></div>${e.delta != null ? `<span class="badge">+${Math.ceil(e.delta)} ${esc(t("min"))}</span>` : ""}<button class="x" data-del="${i}" aria-label="${esc(t("Delete"))} ${esc(e.name)}">✕</button></li>`,
        )
        .join("")
    : `<li><small>${esc(t("Add up to 10 errands to check driving detours."))}</small></li>`;
  $("#hist").innerHTML = trips.length
    ? trips
        .map(
          (item, i) =>
            `<li><span class="chip">${esc(tLabel(item.mode))}</span><div class="t"><b>${esc(item.name)}</b><small>${esc(new Date(item.start).toLocaleString(language()))}</small><small>${formatTime(item.dur)} · ${(item.dist / 1000).toFixed(2)} km</small></div><button data-rename="${i}">${esc(t("Rename"))}</button><button data-delete="${i}" aria-label="${esc(t("Delete trip"))} ${esc(item.name)}">${esc(t("Delete"))}</button></li>`,
        )
        .join("")
    : `<li><small>${esc(t("Your finished trips show up here."))}</small></li>`;
}
function onFix(p) {
  const n = {
    lat: p.coords.latitude,
    lng: p.coords.longitude,
    time: p.timestamp,
    accuracy: p.coords.accuracy,
    speed: Math.max(0, p.coords.speed || 0),
  };
  if (!validPoint(n) || !Number.isFinite(n.accuracy)) return;
  const previous = fix;
  if (previous && n.time <= previous.time) return;
  fix = n;
  $("#location-help").hidden = true;
  const first = !car;
  if (!car)
    car = L.circleMarker([n.lat, n.lng], {
      radius: 9,
      color: "white",
      weight: 3,
      fillColor: "#2f6fed",
      fillOpacity: 1,
    }).addTo(map);
  else car.setLatLng([n.lat, n.lng]);
  if (first || follow) map.setView([n.lat, n.lng], first ? 15 : map.getZoom());
  $("#spd").textContent = consent?.speed ? Math.round(n.speed * 3.6) : "–";
  $("#mi").textContent = t(modes[mode()]);
  setStatus(
    "GPS accuracy ±{accuracy} m · driving routes only · keep page open",
    { accuracy: Math.round(n.accuracy) },
  );
  if (trip && n.accuracy <= 50) {
    if (trip.last) {
      const dt = (n.time - trip.last.time) / 1000,
        d = distance(trip.last, n);
      if (
        dt > 0 &&
        d / dt < 70 &&
        d > Math.max(5, (trip.last.accuracy + n.accuracy) / 2)
      ) {
        trip.dist += d;
        trip.last = n;
      } else if (dt > 120) trip.last = n;
    } else trip.last = n;
  }
  if (previous && n.time <= previous.time) fix = previous;
}
function track() {
  if (!consent?.location || consent?.termsVersion !== LEGAL_VERSION)
    return toast("Choose location access in Privacy first.");
  if (watch !== null) navigator.geolocation.clearWatch(watch);
  if (!navigator.geolocation) {
    toast("Geolocation is not supported by this browser.");
    return;
  }
  watch = navigator.geolocation.watchPosition(
    onFix,
    (e) => {
      const message =
        e.code === 1
          ? "Location blocked. Enable permission in browser settings, then press Recenter."
          : "GPS unavailable. Move outdoors and try Recenter.";
      setStatus(message);
      $("#location-help").hidden = e.code !== 1;
      toast(message);
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 },
  );
}
function privacy() {
  if (trip) return toast("End your trip before changing privacy settings.");
  if (consent) {
    $("#c-speed").checked = !!consent.speed;
    $("#c-mode").checked = !!consent.mode;
    $("#c-log").checked = !!consent.log;
  }
  $("#accept-terms").checked = consent?.termsVersion === LEGAL_VERSION;
  $("#consent").showModal();
}
$("#browse").onclick = () => {
  if (!$("#accept-terms").checked)
    return toast("Accept the draft Terms before continuing.");
  consent = {
    location: false,
    speed: false,
    mode: false,
    log: $("#c-log").checked,
    termsVersion: LEGAL_VERSION,
    acceptedAt: new Date().toISOString(),
  };
  persist("consent", consent);
  if (watch !== null) {
    navigator.geolocation?.clearWatch(watch);
    watch = null;
  }
  fix = null;
  if (car) {
    car.remove();
    car = null;
  }
  $("#consent").close();
  $("#location-help").hidden = true;
  setStatus("Browsing without location. Open Privacy to enable GPS.");
};
$("#allow").onclick = () => {
  if (!$("#accept-terms").checked)
    return toast("Accept the draft Terms before continuing.");
  consent = {
    location: true,
    termsVersion: LEGAL_VERSION,
    acceptedAt: new Date().toISOString(),
    speed: $("#c-speed").checked,
    mode: $("#c-mode").checked,
    log: $("#c-log").checked,
  };
  persist("consent", consent);
  $("#consent").close();
  $('#modeSel option[value="auto"]').disabled = !consent.mode;
  if (!consent.mode) $("#modeSel").value = "DRIVING";
  track();
};
$("#privacy").onclick = privacy;
$("#loc").onclick = () => {
  follow = true;
  if (fix) map.setView([fix.lat, fix.lng], 16);
  track();
};
$("#grab").onclick = () => $("#panel").classList.toggle("min");
$("#add").onclick = () => {
  if (busy) return;
  const name = $("#en").value.trim(),
    place = $("#ep").value.trim();
  if (!name || !place) return toast("Enter both a task and a place.");
  if (errands.length >= 10)
    return toast("Maximum 10 errands. Remove one first.");
  errands.push({ name, place, pick: false });
  persist("errands", errands);
  $("#en").value = $("#ep").value = "";
  render();
};
function draw(r) {
  routeLine.setLatLngs(r.path);
  follow = false;
  map.fitBounds(routeLine.getBounds(), {
    paddingTopLeft: innerWidth >= 800 ? [430, 100] : [25, 100],
    paddingBottomRight: [25, innerWidth >= 800 ? 40 : innerHeight * 0.62],
  });
}
async function reroute() {
  if (!destination || !fix) return;
  const points = errands.filter((e) => e.pick && validPoint(e));
  draw(await route([fix, ...points, destination]));
}
async function run(task) {
  if (busy) return;
  busy = true;
  $("#go").disabled = true;
  $("#go").textContent = t("Checking…");
  try {
    await task();
  } catch (e) {
    toast(
      e.name === "TimeoutError"
        ? "Service timed out. Try again later."
        : e.message || "Request failed.",
    );
  } finally {
    busy = false;
    $("#go").disabled = false;
    $("#go").textContent = t("Check route");
  }
}
$("#go").onclick = () =>
  run(async () => {
    if (!fix || Date.now() - fix.time > 60000)
      throw new Error("A recent GPS fix is needed. Press Recenter.");
    const q = $("#dest").value.trim();
    if (!q) throw new Error("Enter a destination.");
    if (mode() !== "DRIVING")
      throw new Error(
        "Free routing supports car driving only. Choose Car. Walking and cycling can still be recorded.",
      );
    destination = await geocode(q);
    const baseline = await route([fix, destination]);
    for (const e of errands) {
      e.delta = null;
      e.pick = false;
    }
    for (const e of errands) {
      const found = await geocode(e.place);
      Object.assign(e, { lat: found.lat, lng: found.lng });
      const r = await route([fix, e, destination]);
      e.delta = Math.max(0, (r.duration - baseline.duration) / 60000);
      e.pick = e.delta <= +$("#th").value;
    }
    persist("errands", errands);
    render();
    markers.clearLayers();
    for (const p of [destination, ...errands.filter(validPoint)])
      L.circleMarker([p.lat, p.lng], { radius: 7 })
        .bindPopup(document.createTextNode(p.name))
        .addTo(markers);
    await reroute();
    toast(
      "Driving route ready. Detours are estimates; selected stops use list order.",
    );
  });
$("#list").onclick = (e) => {
  if (busy) return;
  const d = e.target.dataset;
  if (d.del != null) {
    errands.splice(+d.del, 1);
  } else if (d.pick != null) {
    errands[+d.pick].pick = e.target.checked;
  } else return;
  persist("errands", errands);
  render();
  run(reroute);
};
$("#th").oninput = (e) => {
  $("#thv").textContent = e.target.value;
};
$("#th").onchange = () => {
  if (busy) return;
  errands.forEach((e) => {
    if (e.delta != null) e.pick = e.delta <= +$("#th").value;
  });
  persist("errands", errands);
  render();
  run(reroute);
};
$("#trip").onclick = () => {
  if (!trip) {
    if (!fix || Date.now() - fix.time > 60000)
      return toast("Wait for a recent GPS fix before recording.");
    trip = { start: Date.now(), dist: 0, last: fix, mode: mode() };
    $("#trip").textContent = t("End trip");
    $("#trip").classList.add("stop");
    follow = true;
  } else {
    const finished = {
      name: "Untitled trip",
      start: trip.start,
      dur: Date.now() - trip.start,
      dist: trip.dist,
      mode: trip.mode,
    };
    if (consent.log) {
      const name = prompt(t("Name this trip"), t("My trip"));
      finished.name = (name?.trim() || t("Untitled trip")).slice(0, 120);
      trips.unshift(finished);
      trips = trips.slice(0, 50);
      persist("trips", trips);
      toast("Trip saved in this browser.");
    } else toast("Trip ended. History is disabled; nothing saved.");
    trip = null;
    $("#trip").textContent = t("Start trip");
    $("#trip").classList.remove("stop");
    $("#el").textContent = "0:00";
    render();
  }
};
$("#hist").onclick = (e) => {
  const d = e.target.dataset;
  if (d.rename != null) {
    const record = trips[+d.rename],
      name = prompt(t("Trip name"), record.name);
    if (name === null) return;
    record.name = name.trim().slice(0, 120) || t("Untitled trip");
  } else if (d.delete != null) {
    if (!confirm(t("Delete this trip permanently?"))) return;
    trips.splice(+d.delete, 1);
  } else return;
  persist("trips", trips);
  render();
};
$("#export").onclick = () => {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(getBackup(), null, 2)], {
      type: "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "dotheading-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
setInterval(() => {
  if (trip) $("#el").textContent = formatTime(Date.now() - trip.start);
}, 1000);
window.addEventListener("beforeunload", (e) => {
  if (trip) {
    e.preventDefault();
    e.returnValue = "";
  }
});
window.addEventListener("offline", () =>
  toast("Offline: maps and routes need internet. GPS recording may continue."),
);
$("#modeSel").onchange = () => {
  $("#mi").textContent = t(modes[mode()]);
  routeLine.setLatLngs([]);
  destination = null;
};
render();
if (
  consent &&
  typeof consent === "object" &&
  consent.termsVersion === LEGAL_VERSION
) {
  $('#modeSel option[value="auto"]').disabled = !consent.mode;
  if (!consent.mode) $("#modeSel").value = "DRIVING";
  track();
} else privacy();

const library = setupLibrary({
  notify: toast,
  getErrands: () => errands,
  isBusy: () => busy,
  appendErrands: (tasks) => {
    errands.push(...tasks);
    persist("errands", errands);
    render();
  },
});
function getBackup() {
  return {
    ...library.get(),
    version: 1,
    trips,
    errands: errands.map((e) => ({ name: e.name, place: e.place })),
  };
}
function restore(data) {
  if (trip) throw new Error("End your trip before restoring.");
  const restored = validateBackup(data);
  // Retain the in-memory state if storage cannot persist the replacement.
  if (!save("trips", restored.trips))
    throw new Error("Unable to store restored trips.");
  library.restore(restored);
  trips = restored.trips;
  errands = restored.errands;
  persist("errands", errands);
  markers.clearLayers();
  routeLine.setLatLngs([]);
  destination = null;
  render();
  toast("Trips and errands restored on this device.");
}
$("#open-account").onclick = () => $("#account-dialog").showModal();
$("#close-account").onclick = () => $("#account-dialog").close();
$("#import-backup").onclick = () => {
  if (trip) return toast("End your trip first.");
  $("#backup-file").click();
};
$("#backup-file").onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    if (file.size > 200000)
      throw new Error("Backup is too large (maximum 200 KB).");
    const data = JSON.parse(await file.text());
    validateBackup(data);
    if (
      confirm(
        t("Replace local trips and errands? Export first to keep a copy."),
      )
    )
      restore(data);
  } catch (error) {
    toast(error.message || "Invalid JSON backup.");
  } finally {
    e.target.value = "";
  }
};
$("#clear-device").onclick = () => {
  if (trip) return toast("End your trip first.");
  if (
    !confirm(
      t(
        "Delete device trips, errands, profile and preferences? Cloud backups are separate and will remain.",
      ),
    )
  )
    return;
  try {
    for (const key of [
      "trips",
      "errands",
      "profile",
      "consent",
      "destinations",
      "templates",
    ])
      localStorage.removeItem("wio:" + key);
  } catch {
    return toast("Could not clear browser storage.");
  }
  library.clear();
  trips = [];
  errands = [];
  consent = null;
  fix = null;
  if (watch !== null) {
    navigator.geolocation?.clearWatch(watch);
    watch = null;
  }
  if (car) {
    car.remove();
    car = null;
  }
  $("#profile-name").value = "";
  markers.clearLayers();
  routeLine.setLatLngs([]);
  destination = null;
  render();
  privacy();
};
setupAccounts({ notify: toast, getBackup, restore, isRecording: () => !!trip });
setupInstall(() => !!trip, toast);

window.addEventListener("dotheading:language", () => {
  render();
  setStatus(statusMessage, statusValues);
  $("#trip").textContent = t(trip ? "End trip" : "Start trip");
  $("#go").textContent = t(busy ? "Checking…" : "Check route");
  $("#mi").textContent = t(modes[mode()]);
});
setStatus(statusMessage, statusValues);
