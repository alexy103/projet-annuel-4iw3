import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  css: ["@/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: ["@nuxt/fonts", "@nuxt/icon"],
  fonts: {
    families: [
      {
        name: "Jost",
        provider: "google",
      },
    ],
    defaults: {
      weights: [400, 500, 600, 700, 800, 900],
      subsets: ["latin"],
    },
  },
  icon: {
    mode: "css",
    cssLayer: "base",
  },
});
