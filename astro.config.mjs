// @ts-check
import { config } from "dotenv";
config(); // Load .env file before any other imports

import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

/**
 * Vite plugin to log RAG configuration on dev server start
 */
function ragConfigLogger() {
  return {
    name: "rag-config-logger",
    configureServer() {
      // Dynamic import to avoid issues during build
      import("./src/config/index.ts").then((module) => {
        module.logRagConfig();
      });
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://emintham.com",
  output: "static", // Static site generation
  exclude: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"],
  integrations: [sitemap(), mdx(), react()],
  adapter: cloudflare(),
  vite: {
    plugins: [
      process.env.NODE_ENV === "development" ? ragConfigLogger() : null,
    ].filter(Boolean),
    server: {
      watch: {
        // Ignore content directory to prevent HMR refresh during auto-save
        ignored: ["**/src/content/**"],
      },
    },
    ssr: {
      external: ["@lancedb/lancedb"],
    },
  },
});
