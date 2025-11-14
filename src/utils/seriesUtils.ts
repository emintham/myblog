// src/utils/seriesUtils.ts
import type { CollectionEntry } from "astro:content";

export interface SeriesNavigationData {
  previousPost: CollectionEntry<"blog"> | null;
  nextPost: CollectionEntry<"blog"> | null;
  currentIndex: number;
  totalPosts: number;
  allSeriesPosts: CollectionEntry<"blog">[];
}

/**
 * Get navigation data for posts in a series
 */
export function getSeriesNavigation(
  currentPost: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[]
): SeriesNavigationData | null {
  const seriesName = currentPost.data.series;

  if (!seriesName) {
    return null;
  }

  // Get all posts in the same series, sorted chronologically
  const seriesPosts = allPosts
    .filter((post) => post.data.series === seriesName)
    .sort((a, b) => a.data.pubDate.valueOf() - b.data.pubDate.valueOf());

  const currentIndex = seriesPosts.findIndex(
    (post) => post.slug === currentPost.slug
  );

  if (currentIndex === -1) {
    return null;
  }

  return {
    previousPost: currentIndex > 0 ? seriesPosts[currentIndex - 1] : null,
    nextPost:
      currentIndex < seriesPosts.length - 1
        ? seriesPosts[currentIndex + 1]
        : null,
    currentIndex: currentIndex + 1, // 1-based index for display
    totalPosts: seriesPosts.length,
    allSeriesPosts: seriesPosts,
  };
}
