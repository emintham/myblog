// src/content/config.ts
import { defineCollection, z } from "astro:content";
import { AUTHOR_NAME } from "../siteConfig.ts";

const blogCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string().optional(),
    author: z.string().default(AUTHOR_NAME),
    tags: z.array(z.string()).optional(),
    series: z.string().optional(),
    draft: z.boolean().optional(),
    postType: z.enum(["fleeting", "standard"]).optional().default("standard"),
  }),
});

export const collections = {
  blog: blogCollection,
};
