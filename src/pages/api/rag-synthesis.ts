import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../schemas/responses";
import { getRAGService } from "../../services/rag/index";
import type { ChunkMetadata } from "../../services/rag/chunking";

// Type guard to check if metadata is ChunkMetadata (post)
function isPostMetadata(metadata: unknown): metadata is ChunkMetadata {
  return (
    typeof metadata === "object" &&
    metadata !== null &&
    "slug" in metadata &&
    "title" in metadata
  );
}

interface FleetingThought {
  slug: string;
  title: string;
  relatedCount: number;
  relatedPosts: Array<{
    slug: string;
    title: string;
    score: number;
  }>;
}

interface OrphanedContent {
  slug: string;
  title: string;
  postType: string;
  connectionCount: number;
}

interface UnreferencedQuote {
  quotesRef: string;
  bookTitle: string;
  bookAuthor: string;
  quoteText: string;
  quoteIndex: number;
}

/**
 * GET /api/rag-synthesis
 *
 * Analyzes content to identify synthesis opportunities:
 * - Fleeting thoughts with 3+ related posts (could be expanded)
 * - Orphaned content with <2 semantic connections
 * - Unreferenced quotes from books
 */
export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) {
    return createErrorResponse("Not available in production", 403);
  }

  try {
    const ragService = await getRAGService();
    const allPosts = await getCollection("blog");

    const fleetingThoughts: FleetingThought[] = [];
    const orphanedContent: OrphanedContent[] = [];
    const unreferencedQuotes: UnreferencedQuote[] = [];

    // 1. Find fleeting thoughts with 3+ related posts
    for (const post of allPosts) {
      if (post.data.postType === "fleeting") {
        const relatedResults = await ragService.query(post.body, {
          topK: 10,
          contentType: "posts",
        });

        // Filter out self and count unique related posts
        const relatedPosts = relatedResults
          .filter(
            (r) => isPostMetadata(r.metadata) && r.metadata.slug !== post.slug
          )
          .slice(0, 5);

        if (relatedPosts.length >= 3) {
          fleetingThoughts.push({
            slug: post.slug,
            title: post.data.title,
            relatedCount: relatedPosts.length,
            relatedPosts: relatedPosts.map((r) => {
              const meta = r.metadata as ChunkMetadata;
              return {
                slug: meta.slug,
                title: meta.title,
                score: r.score,
              };
            }),
          });
        }
      }
    }

    // 2. Find orphaned content (posts with <2 semantic connections)
    for (const post of allPosts) {
      const relatedResults = await ragService.query(post.body, {
        topK: 5,
        contentType: "posts",
      });

      // Filter out self
      const connections = relatedResults.filter(
        (r) =>
          isPostMetadata(r.metadata) &&
          r.metadata.slug !== post.slug &&
          r.score > 0.5 // Only count meaningful connections
      );

      if (connections.length < 2) {
        orphanedContent.push({
          slug: post.slug,
          title: post.data.title,
          postType: post.data.postType,
          connectionCount: connections.length,
        });
      }
    }

    // 3. Find unreferenced quotes
    const bookNotePosts = allPosts.filter(
      (p: CollectionEntry<"blog">): p is CollectionEntry<"blog"> =>
        p.data.postType === "bookNote" && !!p.data.quotesRef
    );

    for (const bookNote of bookNotePosts) {
      try {
        const quotesRef = bookNote.data.quotesRef!;
        const quotesEntry = await getCollection("bookQuotes").then(
          (quotes: CollectionEntry<"bookQuotes">[]) =>
            quotes.find(
              (q: CollectionEntry<"bookQuotes">) => q.id === quotesRef
            )
        );

        if (quotesEntry?.data?.quotes) {
          for (let i = 0; i < quotesEntry.data.quotes.length; i++) {
            const quote = quotesEntry.data.quotes[i];

            // Search all posts for references to this quote
            const isReferenced = allPosts.some(
              (post: CollectionEntry<"blog">) =>
                post.body.includes(quote.text.substring(0, 50))
            );

            if (!isReferenced) {
              unreferencedQuotes.push({
                quotesRef,
                bookTitle: bookNote.data.bookTitle || "Unknown",
                bookAuthor: bookNote.data.bookAuthor || "Unknown",
                quoteText: quote.text,
                quoteIndex: i,
              });
            }
          }
        }
      } catch (error) {
        console.warn(
          `[RAG Synthesis] Failed to process quotes for ${bookNote.data.quotesRef}:`,
          error
        );
      }
    }

    return createSuccessResponse({
      fleetingThoughts: fleetingThoughts.slice(0, 10), // Limit to top 10
      orphanedContent: orphanedContent.slice(0, 10), // Limit to top 10
      unreferencedQuotes: unreferencedQuotes.slice(0, 20), // Limit to top 20
      counts: {
        fleetingThoughts: fleetingThoughts.length,
        orphanedContent: orphanedContent.length,
        unreferencedQuotes: unreferencedQuotes.length,
      },
    });
  } catch (error: unknown) {
    console.error(
      "[API RAG Synthesis] Error generating synthesis data:",
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(
      "Error generating synthesis opportunities.",
      500,
      errorMessage
    );
  }
};
