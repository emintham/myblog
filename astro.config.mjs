// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import { contentHmr } from "./vite-plugin-content-hmr.mjs";

// https://astro.build/config
export default defineConfig({
  site: 'https://emintham.com',
  output: "static", // Static site generation
  exclude: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"],
  integrations: [sitemap(), mdx(), react()],
  adapter: cloudflare(),
  vite: {
    plugins: [
      // Debounce content updates to prevent auto-save spam while allowing manual updates
      contentHmr({ debounceMs: 3000 })
    ],
  },
});
