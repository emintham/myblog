// src/content/config.ts
import { defineCollection, z } from "astro:content";
import { AUTHOR_NAME } from "../siteConfig.ts"; // Adjust path if siteConfig.ts is not in src/

// Define the schema for an individual quote
const quoteSchema = z.object({
  text: z.string(),
  tags: z.array(z.string()).optional(), // Tags for the quote itself
  quoteAuthor: z.string().optional(), // Who said the quote (if not the book's author)
  quoteSource: z.string().optional(), // Source of the quote, if it's a quote-within-a-quote (e.g., "As cited in...")
});

// New DATA collection for book quotes
// Each entry in this collection will be a JSON or YAML file
// named, for example, after the book's slug (e.g., "name-of-the-wind.json")
// and will contain an array of quotes for that book.
const bookQuotesCollection = defineCollection({
  type: "data", // This is a data collection, not content
  schema: z.object({
    bookSlug: z.string(), // To clearly link this set of quotes to a book
    quotes: z.array(quoteSchema),
  }),
});

// Main blog collection (for Markdown/MDX content)
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
    postType: z
      .enum(["fleeting", "standard", "bookNote"])
      .optional()
      .default("standard"),

    // --- Fields specific to Book Notes ---
    bookTitle: z.string().optional(),
    bookAuthor: z.string().optional(), // Author of the book itself
    bookCover: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    // Reference to the quotes file in the 'bookQuotes' data collection.
    // This would typically match the filename (without extension) of the quotes JSON/YAML file.
    // For example, if your book note slug is "my-amazing-book", you might have a
    // src/content/bookQuotes/my-amazing-book.json file.
    quotesRef: z.string().optional(),
    bookTags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  blog: blogCollection,
  bookQuotes: bookQuotesCollection, // Add the new data collection
};
