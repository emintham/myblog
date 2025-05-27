// src/utils/tagUtils.ts
import { getCollection, type CollectionEntry } from "astro:content";

type TagExtractor<DataType> = (data: DataType) => string[] | string | undefined;

export interface TagWithCount {
  tag: string;
  count: number;
}

/**
 * Fetches and processes unique tags with their counts from a specified Astro content collection.
 * @param collectionName The name of the collection (e.g., 'blog', 'bookQuotes').
 * @param extractTagsFn A function that takes an entry's data and returns its tags.
 * @param filterPredicate An optional function to filter entries before processing.
 * @returns A promise that resolves to an array of objects, each containing a unique tag and its count,
 *          sorted by count (descending) and then by tag name (ascending alphabetically).
 */
export async function getUniqueTagsWithCounts<C extends "blog" | "bookQuotes">(
  collectionName: C,
  extractTagsFn: TagExtractor<CollectionEntry<C>["data"]>,
  filterPredicate?: (entry: CollectionEntry<C>) => boolean
): Promise<TagWithCount[]> {
  const allEntries = await getCollection(collectionName, filterPredicate);
  const tagCounts = new Map<string, number>();

  allEntries.forEach((entry) => {
    const tagsSource = extractTagsFn(entry.data);
    let currentEntryTags: string[] = [];

    if (typeof tagsSource === "string") {
      currentEntryTags = tagsSource
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    } else if (Array.isArray(tagsSource)) {
      currentEntryTags = tagsSource
        .map((t) => String(t).trim())
        .filter(Boolean);
    }

    currentEntryTags.forEach((tag) => {
      const normalizedTag = tag.toLowerCase();
      if (normalizedTag) {
        tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
      }
    });
  });

  const sortedTagsWithCounts = Array.from(tagCounts.entries()).map(
    ([tag, count]) => ({ tag, count })
  );

  // Sort by count (descending), then by tag name (ascending)
  sortedTagsWithCounts.sort((a, b) => {
    if (b.count === a.count) {
      return a.tag.localeCompare(b.tag);
    }
    return b.count - a.count;
  });

  return sortedTagsWithCounts;
}

/**
 * Fetches and processes unique tag names from a specified Astro content collection.
 * @param collectionName The name of the collection (e.g., 'blog', 'bookQuotes').
 * @param extractTagsFn A function that takes an entry's data and returns its tags.
 * @param filterPredicate An optional function to filter entries before processing.
 * @returns A promise that resolves to a sorted array of unique, normalized (lowercase) tag names,
 *          sorted alphabetically.
 */
export async function getUniqueTagNames<C extends "blog" | "bookQuotes">(
  collectionName: C,
  extractTagsFn: TagExtractor<CollectionEntry<C>["data"]>,
  filterPredicate?: (entry: CollectionEntry<C>) => boolean
): Promise<string[]> {
  const tagsWithCounts = await getUniqueTagsWithCounts(
    collectionName,
    extractTagsFn,
    filterPredicate
  );
  // Return only tag names, sorted alphabetically
  return tagsWithCounts
    .map((item) => item.tag)
    .sort((a, b) => a.localeCompare(b));
}
