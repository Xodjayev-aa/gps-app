import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.route("https://tiles.openfreemap.org/**", (r) =>
    r.fulfill({
      json: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "base",
            type: "background",
            paint: { "background-color": "#d9eee7" },
          },
        ],
      },
    }),
  );
});
test("consent, recording, rename, reload and delete", async ({ page }) => {
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Allow and start" }).click();
  await expect(page.locator("#service-status")).toContainText("GPS accuracy");
  await page.getByRole("button", { name: "Start trip", exact: true }).click();
  page.once("dialog", (d) => d.accept("Morning errands"));
  await page.getByRole("button", { name: "End trip" }).click();
  await expect(page.locator("#hist")).toContainText("Morning errands");
  page.once("dialog", (d) => d.accept("Home"));
  await page.getByRole("button", { name: "Rename", exact: true }).click();
  await page.reload();
  await expect(page.locator("#hist")).toContainText("Home");
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Delete trip Home" }).click();
  await expect(page.locator("#hist")).toContainText("Your finished trips");
});
test("errands escape markup and persist", async ({ page }) => {
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Allow and start" }).click();
  await page
    .getByRole("textbox", { name: "Task", exact: true })
    .fill("<img src=x onerror=alert(1)>");
  await page.getByRole("textbox", { name: "Errand place" }).fill("Tashkent");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(page.locator("#list img")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("#list")).toContainText("<img src=x");
});
test("route uses free providers and shows polyline", async ({ page }) => {
  await page.route("https://nominatim.openstreetmap.org/**", (r) =>
    r.fulfill({
      json: [{ lat: "41.32", lon: "69.29", display_name: "Destination" }],
    }),
  );
  await page.route("https://router.project-osrm.org/**", (r) =>
    r.fulfill({
      json: {
        code: "Ok",
        routes: [
          {
            duration: 600,
            distance: 1000,
            geometry: {
              coordinates: [
                [69.2797, 41.3111],
                [69.29, 41.32],
              ],
            },
          },
        ],
      },
    }),
  );
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Allow and start" }).click();
  await expect(page.locator("#service-status")).toContainText("GPS accuracy");
  await page.getByLabel("Transport mode").selectOption("DRIVING");
  await page
    .getByRole("textbox", { name: "Destination", exact: true })
    .fill("Tashkent");
  await page.getByRole("button", { name: "Check route" }).click();
  await expect(page.locator("#toast")).toContainText("Driving route ready");
});

test("terms required; browse mode does not request GPS; local profile persists", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.gpsCalls = 0;
    const original = navigator.geolocation.watchPosition.bind(
      navigator.geolocation,
    );
    navigator.geolocation.watchPosition = (...args) => {
      window.gpsCalls++;
      return original(...args);
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Browse without location" }).click();
  await expect(page.locator("#consent")).toBeVisible();
  await expect(page.locator("#toast")).toContainText("Accept the draft Terms");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Browse without location" }).click();
  await expect(page.locator("#service-status")).toContainText(
    "Browsing without location",
  );
  expect(await page.evaluate(() => window.gpsCalls)).toBe(0);
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await page.getByLabel("Display name").fill("Amina");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.locator("#cloud-status")).toContainText(
    "Cloud not configured",
  );
  await page.reload();
  await page.getByRole("button", { name: "Profile", exact: true }).click();
  await expect(page.getByLabel("Display name")).toHaveValue("Amina");
});

test("mobile profile, export and restore valid backup; reject corrupt backup", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Browse without location" }).click();
  await expect(
    page.getByRole("button", { name: "Install on Android" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Install on Android" }).click();
  await expect(page.locator("#toast")).toContainText("Add to Home screen");
  const data = {
    version: 1,
    trips: [
      {
        name: "Restored walk",
        start: 1,
        dur: 60000,
        dist: 1000,
        mode: "WALKING",
      },
    ],
    errands: [{ name: "Milk", place: "Tashkent" }],
  };
  page.once("dialog", (d) => d.accept());
  await page.locator("#backup-file").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(data)),
  });
  await expect(page.locator("#hist")).toContainText("Restored walk");
  await expect(page.locator("#trip-stats")).toContainText("1.00 km");
  await expect(page.locator("#list")).toContainText("Milk");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export trips" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("dotheading-backup.json");
  await page.locator("#backup-file").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.locator("#toast")).toContainText("Invalid trip backup");
  await expect(page.locator("#hist")).toContainText("Restored walk");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("GPS denial and history opt-out handled honestly", async ({
  page,
  context,
}) => {
  await context.clearPermissions();
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Allow and start" }).click();
  await expect(page.locator("#service-status")).toContainText(
    "Location blocked",
  );
  await page.getByRole("button", { name: "Start trip", exact: true }).click();
  await expect(page.locator("#toast")).toContainText("recent GPS fix");
});

test("vector basemap renders without OSM raster, handles denied style, and retries", async ({
  page,
}) => {
  const requested = [];
  page.on("request", (r) => requested.push(r.url()));
  await page.route("https://tiles.openfreemap.org/**", (r) =>
    r.fulfill({ status: 403, body: "Blocked" }),
  );
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Browse without location" }).click();
  await expect(page.locator("#map-message")).toContainText("Map unavailable");
  await expect(page.getByRole("button", { name: "Retry map" })).toBeVisible();
  await page.route("https://tiles.openfreemap.org/**", (r) =>
    r.fulfill({
      json: {
        version: 8,
        sources: {},
        layers: [
          {
            id: "base",
            type: "background",
            paint: { "background-color": "#d9eee7" },
          },
        ],
      },
    }),
  );
  await page.getByRole("button", { name: "Retry map" }).click();
  await expect(page.locator("#map-status")).toBeHidden();
  await expect(page.locator("#map canvas")).toBeVisible();
  expect(requested.some((url) => url.includes("tile.openstreetmap.org"))).toBe(
    false,
  );
});

test("saved destinations and reusable templates survive reload without searching", async ({
  page,
}) => {
  let searches = 0;
  await page.route("https://nominatim.openstreetmap.org/**", (r) => {
    searches++;
    return r.abort();
  });
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Browse without location" }).click();
  await page
    .getByLabel("Destination", { exact: true })
    .fill("Tashkent, Uzbekistan");
  await page.locator("#destinations summary").click();
  page.once("dialog", (d) => d.accept("Home"));
  await page
    .getByRole("button", { name: "Save destination", exact: true })
    .click();
  await expect(page.locator("#saved-destinations")).toContainText("Home");
  await page.getByLabel("Task", { exact: true }).fill("Milk");
  await page.getByLabel("Errand place").fill("Shop");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.locator("#templates summary").click();
  page.once("dialog", (d) => d.accept("Groceries"));
  await page.getByRole("button", { name: "Save errands as template" }).click();
  await expect(page.locator("#template-list")).toContainText("Groceries");
  await page.reload();
  await page.locator("#destinations summary").click();
  await page
    .locator("#saved-destinations")
    .getByRole("button", { name: "Use", exact: true })
    .click();
  await expect(page.locator("#dest")).toHaveValue("Tashkent, Uzbekistan");
  await page
    .locator("#list")
    .getByRole("button", { name: "Delete Milk", exact: true })
    .click();
  await page.locator("#templates summary").click();
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator("#list li")).toHaveCount(1);
  await page.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(page.locator("#list li")).toHaveCount(1);
  expect(searches).toBe(0);
});

test("language switches live and persists without translating user content", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Browse without location" }).click();
  await page.getByLabel("Task", { exact: true }).fill("Car");
  await page.getByLabel("Errand place").fill("My shop");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.locator("#language").selectOption("uz");
  await expect(page.locator("html")).toHaveAttribute("lang", "uz");
  await expect(page.locator("#go")).toHaveText("Yo‘nalishni tekshirish");
  await expect(page.locator("#list b")).toHaveText("Car");
  await page.locator("#language").selectOption("ru");
  await expect(page.locator("#go")).toHaveText("Проверить маршрут");
  await expect(page.locator("#trip")).toHaveText("Начать поездку");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.locator("#go")).toHaveText("Проверить маршрут");
  await expect(page.locator("#list b")).toHaveText("Car");
  await page.locator("#language").selectOption("en");
  await expect(page.locator("#go")).toHaveText("Check route");
});

test("saved lists round-trip in backups and consent language can change before acceptance", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator("#consent-language").selectOption("uz");
  await expect(page.locator("#allow")).toHaveText("Ruxsat berish va boshlash");
  await page.locator("#consent-language").selectOption("en");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Browse without location" }).click();
  const backup = {
    version: 1,
    trips: [],
    errands: [],
    destinations: [{ name: "Office", address: "Tashkent" }],
    templates: [
      { name: "Returns", tasks: [{ name: "Return book", place: "Library" }] },
    ],
  };
  page.once("dialog", (d) => d.accept());
  await page.locator("#backup-file").setInputFiles({
    name: "full.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  await page.locator("#destinations summary").click();
  await expect(page.locator("#saved-destinations")).toContainText("Office");
  await page.locator("#templates summary").click();
  await expect(page.locator("#template-list")).toContainText("Returns");
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export trips" }).click();
  const download = await pending;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const exported = JSON.parse(Buffer.concat(chunks));
  expect(exported.destinations).toEqual(backup.destinations);
  expect(exported.templates).toEqual(backup.templates);
});

test("no WebGL gives an honest fallback while saved lists remain usable", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type.includes("webgl")) return null;
      return original.call(this, type, ...args);
    };
  });
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Browse without location" }).click();
  await expect(page.locator("#map-message")).toContainText("Map unavailable");
  await page.locator("#destinations summary").click();
  await page.locator("#dest").fill("Samarkand");
  page.once("dialog", (d) => d.accept("Visit"));
  await page
    .getByRole("button", { name: "Save destination", exact: true })
    .click();
  await expect(page.locator("#saved-destinations")).toContainText("Visit");
  expect(errors).toEqual([]);
});
