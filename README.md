# DotHeading

**Make every stop count.** A key-free GPS trip-summary and errand planner with a
matching direction-dot website logo and installable Android **PWA**.

## Start

Node 22+: `npm ci && npm run dev`. Build with `npm run build`; preview the installable
production app with `npm run preview`. Deploy `dist/` at an HTTPS domain root.
See [DEPLOYMENT.md](DEPLOYMENT.md) for installation, cloud setup and release gates.

## Included

- Leaflet/MapLibre maps with OpenFreeMap vector basemaps and OpenStreetMap data, GPS accuracy and recenter, optional displayed speed.
- Driving routes, up to 10 errands and individual driving detour estimates.
- Trip recording, names/renames, deletion, 50 local summaries and total statistics.
- Up to 20 saved destination addresses and 20 reusable errand-list templates.
- English, Uzbek and Russian interface selection, saved locally; legal documents
  remain explicitly English. User-entered text is never translated.
- Device-only display-name profile; optional real Supabase email-code accounts.
- Explicit cloud upload/download snapshots and self-service cloud account deletion
  when a backend is configured. Row-level security SQL included.
- Validated JSON backup/restore, export and local data deletion.
- Android install button/help, app manifest, regular/maskable icons, offline app
  shell, and update prompt that prevents deliberate updating during a recording.
- Versioned terms acknowledgement, location-free browse mode and privacy choices.
- Draft Terms, Privacy Policy, software licenses and source license notice.
- Security header template, CI, unit and browser tests.

## Important limits

No Google account, billing integration, API secret or paid library is required.
Community tile/search/routing services have usage policies, quotas and no SLA:
this is for light personal/demo use, **not unlimited production infrastructure**.
Cloud requires your own optional provider project and email delivery configuration;
free-tier limits apply. No deployment, backend provisioning or legal review was done.

Routing is **driving only**. Walk/bike/scooter modes can record summaries but cannot
request routes. Selected stops use list order, not optimized ordering. Individual
detours are relative to the direct route; combined detours may be larger. No
turn-by-turn navigation, live traffic, emergency use or safety guarantees.

PWA installation is not an APK. Keep the app open while recording: background,
locked-screen GPS and active-trip recovery after forced termination are **not**
guaranteed. GPS noise filtering can undercount short movements. Active recordings
are memory-only. Export important data. No full route traces or public sharing.

Local data stays in browser storage until you explicitly upload a backup. Tile,
search and route providers still receive requested map/search/coordinate data and
IP information. A local profile is not password protection. Optional cloud
sessions persist in browser storage; sign out and clear device data on shared phones.
No analytics or marketing trackers are included.

## Verification

7 unit tests, 11 browser scenarios and 1 production PWA/offline test passed locally;
production build and dependency audit also passed. Browser routes are mocked.
Live email auth/database isolation/account deletion and actual Android-device GPS
and installation still require testing. See deployment release gates; this is a
**preview**, not a fully approved international production service.

## Next ideas

1. Search/filter trip history and optional travel-purpose tags.
2. Native-speaker review of interface translations and legal translations.
3. A native Android foreground-service implementation only if reliable locked-
   screen tracking becomes essential, with battery/notification/privacy controls.

MIT source license. User Terms and Privacy Policy are separate draft documents;
operator identity/contact, target-market details and qualified review are needed
before international launch. No merge or public deployment has been performed.

## Basemap incident and regression coverage

The original raster source rendered OSM access-block images in the preview. The
app no longer requests `tile.openstreetmap.org`. It uses OpenFreeMap's documented
public, key-free vector service through a separately bundled MapLibre worker.
This is not a proxy, a header spoof or an attempt to evade the OSM server block.
Attribution remains visible. Failed style/tile/WebGL loading stops the layer and
shows a retryable notice without repeated raster error images. No automatic
provider hopping is used.

Provider failures and successful rendering are tested with local style responses,
including production worker loading. External OpenFreeMap reachability still must
be checked from the deployed user's browser: outbound access to tile services is
restricted in the development sandbox. Search (Nominatim) and routing (OSRM) keep
their separate rate/usage limits; changing the basemap does not change those.
The vector renderer is loaded on demand; its worker and renderer increase the
initial download size. Both are included in the offline app shell, but map data,
glyphs and styles remain network-only.
