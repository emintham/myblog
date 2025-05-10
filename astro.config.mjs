// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: 'https://your-blog-url.com', // TODO: Replace with your actual site URL
  integrations: [
    sitemap()
  ],

});
