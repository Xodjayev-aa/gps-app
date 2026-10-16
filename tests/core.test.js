import { test } from "node:test";
import assert from "node:assert/strict";
import {
  distance,
  formatTime,
  escapeHTML,
  validPoint,
  validTrip,
  load,
  save,
} from "../src/core.js";
test("distance is zero for identical points and about 111 km per degree", () => {
  assert.equal(distance({ lat: 0, lng: 0 }, { lat: 0, lng: 0 }), 0);
  assert.ok(
    Math.abs(distance({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }) - 111195) < 10,
  );
});
test("elapsed time handles hours", () =>
  assert.equal(formatTime(3661000), "61:01"));
test("user labels are escaped", () =>
  assert.equal(
    escapeHTML('<img onerror="x">'),
    "&lt;img onerror=&quot;x&quot;&gt;",
  ));
test("coordinates and trip schema reject invalid data", () => {
  assert.equal(validPoint({ lat: 91, lng: 0 }), false);
  assert.equal(validTrip({ name: "x", start: 0, dur: -1, dist: 0 }), false);
});
test("storage failure is nonfatal", () => {
  assert.equal(save("x", {}), false);
  assert.deepEqual(load("x", []), []);
});

test("backup parser validates schema and strips untrusted fields", async () => {
  const { validateBackup } = await import("../src/core.js");
  const trip = {
    name: "Hi",
    start: 0,
    dur: 10,
    dist: 10,
    mode: "DRIVING",
    injected: "bad",
  };
  const parsed = validateBackup({
    version: 1,
    trips: [trip],
    errands: [{ name: "X", place: "Y", lat: 100, pick: true }],
  });
  assert.equal(parsed.trips[0].injected, undefined);
  assert.equal(parsed.errands[0].pick, false);
  assert.equal(parsed.errands[0].lat, undefined);
  assert.throws(() => validateBackup({ version: 2, trips: [] }));
  assert.throws(() =>
    validateBackup({ version: 1, trips: Array(51).fill(trip) }),
  );
  assert.throws(() =>
    validateBackup({ version: 1, trips: [{ ...trip, dist: -1 }] }),
  );
  assert.throws(() =>
    validateBackup({
      version: 1,
      trips: [],
      errands: [{ name: 4, place: "X" }],
    }),
  );
});

test("saved lists are bounded, validated and included in portable backups", async () => {
  const { validateLibrary, validateBackup } = await import("../src/core.js");
  const destinations = [{ name: "Home", address: "Tashkent" }];
  const templates = [
    { name: "Weekly", tasks: [{ name: "Milk", place: "Shop", pick: true }] },
  ];
  const parsed = validateBackup({
    version: 1,
    trips: [],
    destinations,
    templates,
  });
  assert.deepEqual(parsed.destinations, destinations);
  assert.deepEqual(parsed.templates, [
    { name: "Weekly", tasks: [{ name: "Milk", place: "Shop" }] },
  ]);
  assert.throws(() =>
    validateLibrary({ destinations: Array(21).fill(destinations[0]) }),
  );
  assert.throws(() =>
    validateLibrary({ templates: [{ name: "x", tasks: [] }] }),
  );
  assert.throws(() =>
    validateLibrary({
      templates: [{ name: "x", tasks: [{ name: "Hi", place: 42 }] }],
    }),
  );
  assert.deepEqual(validateLibrary({}), { destinations: [], templates: [] });
});
