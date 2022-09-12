import { svelte } from "@sveltejs/vite-plugin-svelte";
import Unocss from "unocss/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import * as path from "path";

export default defineConfig({
  base: "/jazz/",
  plugins: [
    svelte(),
    Unocss({}),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["soundfonts/**/*.{js, json}"],
      manifest: {
        name: "JazzyDalpeng",
        short_name: "JazzyDalpeng",
        description: "Jazz Practice Application",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,woff2}"],
        maximumFileSizeToCacheInBytes: 4000000,
      },
    }),
  ],
  optimizeDeps: { include: ["svelte"], exclude: ["svelte-routing"] },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@page": path.resolve(__dirname, "src/page"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 1357,
  },
});
