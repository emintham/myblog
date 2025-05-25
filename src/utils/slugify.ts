// src/utils/slugify.ts
export function generateSlug(text: string): string {
  // If text is initially falsy (empty, null, undefined),
  // the API route already does `title || 'untitled'`, so `text` here should be non-empty.
  // However, an additional check here doesn't hurt, or we rely on the API's fallback.

  const slug = text
    .toString()  // Ensure it's a string
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // Replace spaces with hyphens
    .replace(/[^\w-]+/g, "")     // Remove all non-alphanumeric chars except hyphens and underscores
    .replace(/--+/g, "-")        // Replace multiple hyphens with a single one
    .replace(/^-+/, "")          // Trim hyphens from the start
    .replace(/-+$/, "");         // Trim hyphens from the end

  // If the slug becomes empty after all the processing (e.g., input was "!!! --- !!!")
  // return a default slug to ensure a filename can always be created.
  return slug || "untitled-post";
}
