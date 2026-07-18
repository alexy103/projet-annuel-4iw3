import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  devServer: { port: 3000 },
  runtimeConfig: {
    apiUrl: process.env.API_URL,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3003/api",
      apiUrl: process.env.NUXT_PUBLIC_API_URL || process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3003/api",
      apiKey: process.env.NUXT_PUBLIC_API_KEY || "test",
      backendUrl: process.env.NUXT_PUBLIC_BACKEND_URL || "http://localhost:3003",
      githubClientId: process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID || "",
    },
  },
  css: ["@/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  modules: [
    "@nuxt/fonts",
    "@nuxt/icon",
    "nuxt-qrcode",
    "@nuxt/image",
    "@pinia/nuxt",
    "@nuxt/ui",
  ],
  ui: {
    colorMode: false,
  },
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
