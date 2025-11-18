/**
 * Shared formatting utilities for RAG Phase 4 features
 */

/**
 * Format similarity score as percentage string
 * @param score - Score between 0 and 1
 * @returns Formatted percentage without decimal places (e.g., "85")
 */
export function formatScore(score: number): string {
  return (score * 100).toFixed(0);
}

/**
 * Format date with customizable options
 * @param dateStr - ISO date string or undefined
 * @param options - Intl.DateTimeFormatOptions for formatting
 * @returns Formatted date string or null if invalid/missing
 */
export function formatDate(
  dateStr: string | undefined,
  options?: Intl.DateTimeFormatOptions
): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
    };
    return date.toLocaleDateString("en-US", options || defaultOptions);
  } catch {
    return null;
  }
}

/**
 * Format date with full timestamp (for stats/logs)
 * @param dateStr - ISO date string
 * @returns Formatted date with time or original string if invalid
 */
export function formatDateWithTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format quote as markdown blockquote with attribution
 * @param text - Quote text
 * @param author - Quote author
 * @param source - Optional source (book title, article, etc.)
 * @returns Formatted markdown blockquote
 */
export function formatQuoteMarkdown(
  text: string,
  author: string,
  source?: string
): string {
  const attribution = source ? `${author}, ${source}` : author;
  return `> ${text}\n> \n> — ${attribution}`;
}
