/**
 * Clipboard utilities with error handling
 */

import { formatQuoteMarkdown } from "./formatting";

/**
 * Copy text to clipboard with error handling
 * @param text - Text to copy
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Copy markdown link to clipboard
 * @param title - Link text
 * @param url - Link URL
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function copyMarkdownLink(
  title: string,
  url: string
): Promise<boolean> {
  return copyToClipboard(`[${title}](${url})`);
}

/**
 * Copy formatted quote to clipboard
 * @param quote - Quote object with text, author, and optional source
 * @returns Promise resolving to true if successful, false otherwise
 */
export async function copyQuoteMarkdown(quote: {
  text: string;
  author: string;
  source?: string;
}): Promise<boolean> {
  const markdown = formatQuoteMarkdown(quote.text, quote.author, quote.source);
  return copyToClipboard(markdown);
}
