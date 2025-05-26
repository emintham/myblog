// src/types/admin.d.ts

/**
 * Interface for the actual post data structure as it might exist in a
 * database, file frontmatter, or be returned from an API.
 * Fields are mostly optional as they might not all be present.
 */
export interface PostSourceData {
  title?: string;
  pubDate?: string | Date; // Can be Date object or ISO string
  description?: string;
  postType?: string; // e.g., "standard", "fleeting", "bookNote"
  tags?: string | string[]; // Can be array or comma-separated string
  series?: string;
  draft?: boolean;
  bodyContent?: string; // The main markdown content of the post

  // BookNote specific fields
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: { imageName?: string; alt?: string }; // Nested object for book cover details
  quotesRef?: string; // Reference to a quotes file or section
  bookTags?: string | string[]; // Tags specific to the book note

  // Fields for identifying an existing post, typically used for updates
  originalSlug?: string;
  originalFilePath?: string;
  originalExtension?: string; // e.g., ".md" or ".mdx"
}

export interface Quote {
  id: string; // Unique ID for React key prop and managing edits
  text: string;
  quoteAuthor?: string;
  tags?: string[]; // Stored as array in form state
  quoteSource?: string;
}

/**
 * Interface for the data structure used by the react-hook-form.
 * This structure is flat to simplify form handling.
 * Fields are generally required or have defaults in the form.
 */
export interface PostFormData {
  title: string;
  pubDate: string; // Always a string in 'YYYY-MM-DD' format for the date input
  description: string;
  postType: string;
  tags: string; // Always a comma-separated string for the input field
  series: string;
  draft: boolean;
  bodyContent: string;

  // BookNote specific fields (flat for the form)
  bookTitle: string;
  bookAuthor: string;
  bookCoverImageName: string; // Flat structure for form input
  bookCoverAlt: string;       // Flat structure for form input
  quotesRef: string;
  bookTags: string; // Always a comma-separated string for book tags input

  // Original identifiers, carried over if editing an existing post
  originalSlug?: string;
  originalFilePath?: string;
  originalExtension?: string;
  inlineQuotes?: Quote[]; // New field for managing quotes in the form
}

/**
 * Interface for the JSON payload expected by the API handlers.
 * This is similar to PostFormData but represents the data after
 * JSON stringification and parsing.
 */
export interface PostApiPayload {
  title: string;
  pubDate: string;
  description?: string;
  postType: string;
  tags?: string; // Comma-separated string or potentially already an array if pre-processed
  series?: string;
  draft?: boolean | string; // Can be boolean or string like "on" from form
  bodyContent?: string;

  bookTitle?: string;
  bookAuthor?: string;
  bookCoverImageName?: string;
  bookCoverAlt?: string;
  // API might also receive bookCover as a pre-structured object in some cases
  bookCover?: { imageName?: string; alt?: string };
  quotesRef?: string;
  bookTags?: string; // Comma-separated string or potentially an array

  originalSlug?: string;
  originalFilePath?: string;
  originalExtension?: string;
  inlineQuotes?: Quote[]; // For sending quotes data to the API
}

/**
 * Interface for the structured frontmatter object that the API handlers
 * will build before serializing to YAML and writing to a file.
 */
export interface FrontmatterObject {
  title: string;
  pubDate: Date; // Stored as a Date object in the frontmatter
  author?: string; // Typically added by the API handler
  description?: string;
  postType: string;
  tags?: string[]; // Stored as an array of strings
  series?: string;
  draft: boolean; // Stored as a boolean

  // BookNote specific fields
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: { imageName?: string; alt?: string };
  quotesRef?: string;
  bookTags?: string[]; // Stored as an array of strings
}