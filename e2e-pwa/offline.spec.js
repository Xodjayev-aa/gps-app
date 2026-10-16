import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
test("production manifest, icons, offline reload and legal documents", async ({
  page,
  context,
}) => {
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
  const csp = readFileSync("public/_headers", "utf8").match(
    /Content-Security-Policy: (.+)/,
  )[1];
  await page.route("http://127.0.0.1:4173/", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), "content-security-policy": csp },
    });
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.locator("#accept-terms").check();
  await page.getByRole("button", { name: "Browse without location" }).click();
  await expect(page.locator("#map-status")).toBeHidden();
  await expect(page.locator("#map canvas")).toBeVisible();
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.name).toBe("DotHeading");
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.some((i) => i.purpose === "maskable")).toBe(true);
  for (const icon of manifest.icons)
    expect((await page.request.get(icon.src)).ok()).toBe(true);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Profile", exact: true }),
  ).toBeVisible();
  await expect(page.locator("#hist")).toContainText("Your finished trips");
  await page.goto("/legal/privacy.html");
  await expect(
    page.getByRole("heading", { name: "Draft Privacy Policy", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
