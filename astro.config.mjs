// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  site: "https://your-blog-url.com", // TODO: Replace with your actual site URL
  integrations: [sitemap(), react()],
});