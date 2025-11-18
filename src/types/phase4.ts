/**
 * Shared type definitions for RAG Phase 4 features
 */

/**
 * Chat message for Ollama API (simplified interface)
 */
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * Database message with full metadata (matches database schema)
 */
export interface DbMessage {
  id?: number;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at?: string;
  metadata?: string;
}

/**
 * Context mode for AI assistant
 */
export type ContextMode = "current" | "withRAG" | "none";

/**
 * Ollama chat options
 */
export interface OllamaChatOptions {
  model?: string;
  contextMode?: ContextMode;
  currentPost?: {
    title: string;
    body: string;
  };
}

/**
 * RAG query result types
 */
export type ContentType = "post" | "quote";

export interface RAGResultMetadata {
  slug?: string;
  title?: string;
  tags?: string[];
  postType?: string;
  pubDate?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: string;
  quoteTags?: string[];
  quoteAuthor?: string;
  quoteSource?: string;
}

export interface RAGResult {
  content: string;
  score: number;
  metadata: RAGResultMetadata;
  type: ContentType;
  url?: string;
}

/**
 * Synthesis opportunity types
 */
export interface FleetingThought {
  slug: string;
  title: string;
  pubDate: string;
  body: string;
  score: number;
}

export interface OrphanedContent {
  slug: string;
  title: string;
  tags: string[];
  series?: string;
  score: number;
}

export interface UnreferencedQuote {
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  quoteText: string;
  quoteTags: string[];
}

export interface SynthesisData {
  fleetingThoughts: FleetingThought[];
  orphanedContent: OrphanedContent[];
  unreferencedQuotes: UnreferencedQuote[];
}
