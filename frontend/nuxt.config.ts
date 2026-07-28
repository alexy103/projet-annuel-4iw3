import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  devServer: { port: 3000 },
  runtimeConfig: {
    // Serveur uniquement : URL interne du backend, utilisée par la route proxy
    // (server/routes/backend/[...path].ts). Jamais envoyée au navigateur.
    // Nom NUXT_BACKEND_URL obligatoire : Nuxt ne relit une clé privée de
    // runtimeConfig au démarrage du conteneur que si l'env var suit la
    // convention NUXT_<CLÉ> — sinon la valeur par défaut figée au build reste.
    backendUrl: process.env.NUXT_BACKEND_URL || "http://localhost:3003",
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:3003/api",
      apiUrl:
        process.env.NUXT_PUBLIC_API_URL ||
        process.env.NUXT_PUBLIC_API_BASE ||
        "http://localhost:3003/api",
      apiKey: process.env.NUXT_PUBLIC_API_KEY || "test",
      backendUrl:
        process.env.NUXT_PUBLIC_BACKEND_URL || "http://localhost:3003",
      githubClientId: process.env.NUXT_PUBLIC_GITHUB_CLIENT_ID || "",
      umamiWebsiteId: process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || "",
      umamiScriptUrl: process.env.NUXT_PUBLIC_UMAMI_SCRIPT_URL || "",
    },
  },
  app: {
    head: {
      script:
        process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID &&
        process.env.NUXT_PUBLIC_UMAMI_SCRIPT_URL
          ? [
              {
                src: process.env.NUXT_PUBLIC_UMAMI_SCRIPT_URL,
                defer: true,
                "data-website-id": process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID,
              },
            ]
          : [],
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
