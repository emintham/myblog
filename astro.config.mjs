// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: 'https://emintham.com',
  output: "static", // Static site generation
  exclude: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"],
  integrations: [sitemap(), mdx(), react()],
  adapter: cloudflare(),
  vite: {
    server: {
      watch: {
        // Ignore content directory to prevent HMR refresh during auto-save
        ignored: ["**/src/content/**"],
      },
    },
  },
});
