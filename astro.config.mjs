// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://your-blog-url.com", // TODO: Replace with your actual site URL
  output: "static", // Static site generation
  exclude: ["**/__tests__/**", "**/*.test.ts", "**/*.spec.ts"],
  integrations: [sitemap(), mdx(), react()],
  vite: {
    server: {
      watch: {
        // Ignore content directory to prevent HMR refresh during auto-save
        ignored: ["**/src/content/**"],
      },
    },
  },
});
