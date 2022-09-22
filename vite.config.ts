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
      },
    }),
  ],
  optimizeDeps: { include: ["svelte"], exclude: ["svelte-routing"] },
  resolve: {
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "src") },
      { find: "@lib", replacement: path.resolve(__dirname, "src/lib") },
      { find: "@assets", replacement: path.resolve(__dirname, "src/assets") },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "src/components"),
      },
      {
        find: /^@canvas$/,
        replacement: path.resolve(__dirname, "src/components/canvas/index.ts"),
      },
      {
        find: "@canvas",
        replacement: path.resolve(__dirname, "src/components/canvas"),
      },
      { find: "@page", replacement: path.resolve(__dirname, "src/page") },
    ],
  },
  server: {
    host: "0.0.0.0",
    port: 1357,
  },
});
