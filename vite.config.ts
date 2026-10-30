
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "autoUpdate",

      includeAssets: ["favicon.ico"],

      manifest: {
        name: "BRONXWALLET",
        short_name: "BRONX",
        description:
          "Control inteligente de tus finanzas personales",

        theme_color: "#080A0E",
        background_color: "#080A0E",

        display: "standalone",
        start_url: "/",
        scope: "/",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        navigateFallback: "/index.html",

        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,woff2}",
        ],

        // Permite cachear archivos de hasta 5 MB
        maximumFileSizeToCacheInBytes:
          5 * 1024 * 1024,
      },
    }),
  ],
});
