// src/utils/searchUtils.ts
import type { CollectionEntry } from "astro:content";

export interface SearchablePost {
  slug: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  series?: string;
  postType: string;
  pubDate: string;
  url: string;
}

/**
 * Prepares blog posts for search indexing
 */
export function prepareSearchData(
  posts: CollectionEntry<"blog">[]
): SearchablePost[] {
  return posts.map((post) => ({
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    content: post.body || "",
    tags: post.data.tags || [],
    series: post.data.series,
    postType: post.data.postType || "standard",
    pubDate: post.data.pubDate.toISOString(),
    url: `/blog/${post.slug}/`,
  }));
}
