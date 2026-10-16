import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  worker: { format: "es" },
  plugins: [
    VitePWA({
      registerType: "prompt",
      injectRegister: null,
      includeAssets: [
        "logo.svg",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable.png",
        "legal/*.html",
      ],
      manifest: {
        id: "/",
        name: "DotHeading",
        short_name: "DotHeading",
        description: "Private trip summaries and errands, in your direction.",
        lang: "en",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#102b3f",
        theme_color: "#102b3f",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest,txt}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/legal\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
    }),
  ],
  server: { host: "0.0.0.0", allowedHosts: [".e2b.app"] },
  preview: { host: "0.0.0.0", allowedHosts: [".e2b.app"] },
});
