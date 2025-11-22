/**
 * Content chunking utilities for RAG system
 *
 * Handles paragraph-level splitting for posts and quote-level splitting for book notes
 */

export interface ChunkMetadata {
  slug: string;
  title: string;
  postType: "standard" | "fleeting" | "bookNote";
  paragraphIndex?: number;
  tags?: string[];
  series?: string;
  pubDate?: string;
}

export interface QuoteMetadata {
  quotesRef: string;
  bookTitle: string;
  bookAuthor: string;
  tags?: string[];
  quoteAuthor?: string;
  quoteSource?: string;
  quoteIndex: number;
}

export interface Chunk {
  id: string;
  content: string;
  metadata: ChunkMetadata | QuoteMetadata;
}

const MIN_PARAGRAPH_LENGTH = 50;
const MAX_PARAGRAPH_LENGTH = 2000;

/**
 * Split text into sentences for smart paragraph splitting
 */
function splitIntoSentences(text: string): string[] {
  // Simple sentence splitting - handles most common cases
  // Matches: . ! ? followed by space and capital letter, or end of string
  const sentenceRegex = /[.!?]+(?:\s+|$)/g;
  const sentences: string[] = [];
  let lastIndex = 0;
  let match;

  while ((match = sentenceRegex.exec(text)) !== null) {
    const sentence = text
      .slice(lastIndex, match.index + match[0].length)
      .trim();
    if (sentence) {
      sentences.push(sentence);
    }
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text if any
  const remaining = text.slice(lastIndex).trim();
  if (remaining) {
    sentences.push(remaining);
  }

  return sentences;
}

/**
 * Split a long paragraph into smaller chunks at sentence boundaries
 */
function splitLongParagraph(paragraph: string, maxLength: number): string[] {
  if (paragraph.length <= maxLength) {
    return [paragraph];
  }

  const sentences = splitIntoSentences(paragraph);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    // If a single sentence is longer than maxLength, we have to include it anyway
    if (sentence.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      chunks.push(sentence);
      continue;
    }

    // Try adding sentence to current chunk
    const testChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;

    if (testChunk.length <= maxLength) {
      currentChunk = testChunk;
    } else {
      // Current chunk is full, start a new one
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }

  // Add final chunk if any
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Chunk post content into paragraphs
 *
 * @param content - The markdown/text content of the post
 * @param metadata - Metadata to attach to each chunk
 * @returns Array of chunks with IDs and metadata
 */
export function chunkPostContent(
  content: string,
  metadata: Omit<ChunkMetadata, "paragraphIndex">
): Chunk[] {
  // Split on double newlines
  const rawParagraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= MIN_PARAGRAPH_LENGTH);

  const chunks: Chunk[] = [];
  let paragraphIndex = 0;

  for (const paragraph of rawParagraphs) {
    // Split long paragraphs at sentence boundaries
    const subParagraphs = splitLongParagraph(paragraph, MAX_PARAGRAPH_LENGTH);

    for (const subParagraph of subParagraphs) {
      chunks.push({
        id: `post:${metadata.slug}:${paragraphIndex}`,
        content: subParagraph,
        metadata: {
          ...metadata,
          paragraphIndex,
        },
      });
      paragraphIndex++;
    }
  }

  return chunks;
}

/**
 * Create chunks from book quotes
 *
 * @param quotes - Array of quote objects
 * @param bookMetadata - Book-level metadata
 * @returns Array of chunks with IDs and metadata
 */
export function chunkBookQuotes(
  quotes: Array<{
    text: string;
    tags?: string[];
    quoteAuthor?: string;
    quoteSource?: string;
  }>,
  bookMetadata: {
    quotesRef: string;
    bookTitle: string;
    bookAuthor: string;
  }
): Chunk[] {
  return quotes.map((quote, index) => ({
    id: `quote:${bookMetadata.quotesRef}:${index}`,
    content: quote.text,
    metadata: {
      ...bookMetadata,
      tags: quote.tags,
      quoteAuthor: quote.quoteAuthor,
      quoteSource: quote.quoteSource,
      quoteIndex: index,
    },
  }));
}

/**
 * Validate chunk data before indexing
 */
export function validateChunk(chunk: Chunk): boolean {
  if (!chunk.id || !chunk.content) {
    return false;
  }

  if (chunk.content.length < MIN_PARAGRAPH_LENGTH) {
    return false;
  }

  return true;
}
