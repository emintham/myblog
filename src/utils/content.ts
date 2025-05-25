// src/utils/content.ts

interface PostData {
  description?: string;
}

interface Post {
  data: PostData;
  body?: string;
}

/**
 * Extracts a preview content string from a post object.
 * Prioritizes explicit description, then first HTML paragraph, then plain text.
 * @param post The post object, expected to have `data.description` and optionally `body`.
 * @returns A string for preview display.
 */
export function extractPreviewContent(post: Post): string {
  if (post.data.description) {
    return post.data.description;
  }

  if (post.body) {
    const firstParagraphMatch = post.body.match(/<p>.*?<\/p>/s);
    if (firstParagraphMatch && firstParagraphMatch[0]) {
      return firstParagraphMatch[0];
    }
    // Fallback for plain text body or if no <p> tag is found at the beginning
    return post.body.split("\n\n")[0];
  }

  return ""; // Return empty string if no content can be extracted
}
