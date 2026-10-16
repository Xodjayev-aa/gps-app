# DotHeading: deployment and account setup

## Static installable app

1. Use Node 22+, run `npm ci`, `npm test`, `npm run build`.
2. Publish **the contents of `dist/` at the root of an HTTPS domain**. The PWA id,
   scope, asset paths and links use `/`. A GitHub Pages project subpath is NOT
   supported by the current configuration: use a root/custom domain or adjust all
   paths and manifest scope before deployment. No domain or host was provisioned.
3. Hosts supporting `_headers` (e.g. Cloudflare Pages/Netlify) use the supplied
   security headers. On other hosts configure equivalent headers yourself. Keep
   `sw.js` revalidated. Do not cache HTML indefinitely. Preserve the Referer
   header needed to identify tile/search requests to community services.
4. In Android Chrome, visit the HTTPS site and select Install on Android. If the
   install prompt is unavailable, use ⋮ → Add to Home screen → Install. This is
   a PWA, **not an APK**, and no sideload permission is required. Browser-specific
   install requirements vary. Development mode does not register the production
   service worker; test `npm run preview` after building for the offline shell.
5. The app's own code/legal pages work offline after initial caching. Map tiles,
   routing, search, email login and cloud requests are deliberately NOT cached.
   Background or locked-screen GPS is not guaranteed. No APK/Play Store package.

## Optional real accounts (Supabase)

Local profiles work without this setup. They are not authentication. Cloud buttons
remain unavailable until a backend is configured; no fake login is used.

1. Create your own Supabase project, choose a suitable hosting region and review
   current free-tier limits, data-processing terms, quotas and retention. Do not
   enable paid features unless you choose to. Free email delivery is limited and
   may only allow project-team addresses; real public users generally need a
   configured email delivery provider. Unlimited free delivery is NOT promised.
2. Run `supabase/schema.sql` once in the SQL editor. It creates one backup row per
   user, turns on row-level security and grants only authenticated users access to
   their own row. It includes a self-only account-deletion RPC. Never turn off RLS.
   Review it with your backend administrator before production use.
3. Enable email auth and configure the email template to include **`{{ .Token }}`**
   (OTP code), not just a magic-link URL. This app verifies typed email codes and
   does not parse login links. Configure your production Site URL and rate limits.
   Enable appropriate anti-abuse controls before opening public registration.
4. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` to the HTTPS project
   URL and `VITE_SUPABASE_ANON_KEY` to the **public anon/publishable key**. These
   are intentionally public browser configuration. NEVER use `service_role` or
   any secret admin key. Rebuild/redeploy after setting them. Do not post keys in
   chat. Custom Supabase domains require updating the CSP connect-src allowlist.
5. Test with two separate accounts on the actual backend:
   - Sign in by email code, upload/download a backup, sign out and sign in again.
   - Confirm each account can read/write only its own backup, including direct
     REST requests using another user's UUID. Expect denied/empty access.
   - Delete account A; verify both its auth record and backup row are gone and
     account B is unaffected. Attempt anonymous RPC execution: must be denied.
   - Confirm ordinary errors (expired code, email throttle, failed network) are
     surfaced. Revoke sessions and verify stale tokens cannot access deleted data.
6. Backups are manual replacement snapshots, not automatic cross-device merging.
   No data is uploaded simply by signing in. Saved destinations and templates
   are included in backups. Download replaces local trips, saved lists and errands after confirmation. Sign-out keeps device data; clear that separately
   on shared devices. The account-deletion RPC deletes auth user + backup, not
   operator/provider log archives. Document provider retention before launch.

The SQL and account client are included but no live Supabase project, email
provider or database was provisioned/tested in this sandbox. Real-account E2E
and database policy checks are release gates, not claims of completed testing.

## International release gates

- Supply operator legal name, privacy/support email, and contact address if required.
- Finalize target countries, age eligibility, lawful bases, hosting region, cross-
  border safeguards, retention and rights-request procedures with legal review.
- Replace draft notices/documents only after review. Increment `LEGAL_VERSION`
  when terms materially change, and update document/version labels consistently.
- Check name/logo trademarks and domain availability. No clearance was performed.
- Verify Android installation, icon/maskable crop, real GPS distance/permission,
  refresh/update behavior and offline limitations on a physical phone.
- Check live community services and usage policies; this setup is for light use.
  Public-scale traffic needs compliant infrastructure and shared rate limiting.

## Verification

```sh
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
npm run test:pwa
npm audit --audit-level=high
```

The development E2E suite uses port 5174 so it never reuses the live preview
or a stale service worker on port 5173.

`CHROMIUM_PATH` can point to an existing compatible Chromium for local tests.
The PWA suite starts a production preview on port 4173; keep that port available.
CI runs both browser suites. Mocked routes validate app behavior, not provider
uptime; responsive Chromium tests do not replace physical Android testing.

## Basemap and CSP

OpenFreeMap public vector styles: `https://tiles.openfreemap.org/styles/positron`.
See https://github.com/hyperknot/openfreemap for the provider's public-instance
usage statement. No provider key is used. Keep OpenFreeMap/OpenMapTiles/OSM
attribution visible. WebGL is required for the vector background (trip lists,
GPS recording and route overlays are independent). The renderer and worker are
bundled separately; do not replace the worker URL with an unserved node_modules
path. CSP must allow this app's worker and OpenFreeMap style/font/tile fetches;
the supplied `_headers` file has been updated. Older deployments retaining the
old CSP must update headers as well as JS. Do not add a tile proxy to evade blocks.

On an installed app, use Update app when offered (end a recording first). A normal
browser reload may retain the old service worker until the update is accepted.
The provider/privacy disclosure revision requires renewed acknowledgement.
The preview iframe may itself disallow geolocation: use Open full app to request
permission in a top-level tab. Browser/OS location permission remains required.

## Vercel + Supabase handoff

`vercel.json` selects Vite, builds with `npm run build`, publishes `dist/`, and
applies security and service-worker cache headers (Vercel does not read
`public/_headers`). Import this repository in your Vercel account, keep the root
directory at the repository root, and choose Node 22. Add the two public Supabase
configuration values from `.env.example` as Vercel build environment variables,
then redeploy. Complete the Supabase SQL, email-code template, Site URL and
isolation/deletion checks above. No private service/admin key belongs in Vercel's
`VITE_*` variables. The application does not need a continuously running backend
process or an uptime-monitoring service to operate. Optional monitoring alerts
you to outages; it is not a substitute for backups or provider availability.

Merging this implementation does not mean the remaining physical-device,
live-provider, database-isolation, email-auth and legal launch gates are complete.
