// src/utils/tagUtils.ts
import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

/**
 * A generic utility to extract unique values and their counts from a content collection.
 * @param collectionName The name of the collection (e.g., 'blog', 'bookQuotes').
 * @param valueAccessor A function that extracts a value or values from an entry's data.
 *                      It can return a string, an array of strings, or undefined.
 * @param filterPredicate An optional function to filter entries before processing.
 * @returns A promise that resolves to a Map where keys are unique normalized values
 *          and values are their counts.
 */
async function getUniqueValuesFromCollection<C extends "blog" | "bookQuotes">(
  collectionName: C,
  valueAccessor: (
    data: CollectionEntry<C>["data"]
  ) => string[] | string | undefined,
  filterPredicate?: (entry: CollectionEntry<C>) => boolean
): Promise<Map<string, number>> {
  const allEntries = await getCollection(collectionName, filterPredicate);
  const valueCounts = new Map<string, number>();

  allEntries.forEach((entry) => {
    const valuesSource = valueAccessor(entry.data);
    let currentEntryValues: string[] = [];

    if (typeof valuesSource === "string") {
      currentEntryValues = valuesSource
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    } else if (Array.isArray(valuesSource)) {
      currentEntryValues = valuesSource
        .map((v) => String(v).trim())
        .filter(Boolean);
    }

    currentEntryValues.forEach((value) => {
      const normalizedValue = value.toLowerCase();
      if (normalizedValue) {
        valueCounts.set(
          normalizedValue,
          (valueCounts.get(normalizedValue) || 0) + 1
        );
      }
    });
  });

  return valueCounts;
}

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
  extractTagsFn: (
    data: CollectionEntry<C>["data"]
  ) => string[] | string | undefined,
  filterPredicate?: (entry: CollectionEntry<C>) => boolean
): Promise<TagWithCount[]> {
  const tagCounts = await getUniqueValuesFromCollection(
    collectionName,
    extractTagsFn,
    filterPredicate
  );

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
export async function getUniqueTagNames(
  collectionName: "blog" | "bookQuotes",
  tagExtractor: (
    data: CollectionEntry<"blog" | "bookQuotes">["data"]
  ) => string[] | string | undefined,
  filterPredicate?: (
    entry: CollectionEntry<"blog" | "bookQuotes">
  ) => boolean
): Promise<string[]> {
  const tagCounts = await getUniqueValuesFromCollection(
    collectionName,
    tagExtractor,
    filterPredicate
  );
  return Array.from(tagCounts.keys()).sort((a, b) => a.localeCompare(b));
}

export async function getUniqueSeriesNames(): Promise<string[]> {
  const seriesCounts = await getUniqueValuesFromCollection(
    "blog",
    (data) => data.series,
    () => true // Include all posts, draft or not
  );
  return Array.from(seriesCounts.keys()).sort((a, b) => a.localeCompare(b));
}
