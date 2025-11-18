import type { APIRoute } from "astro";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../schemas/responses";
import { getRAGService } from "../../services/rag/index";

// Mark as server-rendered endpoint
export const prerender = false;

interface RAGQueryRequest {
  query: string;
  topK?: number;
  filter?: {
    postType?: string[];
    tags?: string[];
    contentType?: "posts" | "quotes" | "all";
  };
}

/**
 * POST /api/rag-query
 *
 * Query the RAG index for semantically similar content
 */
export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return createErrorResponse("Not available in production", 403);
  }

  try {
    const body = (await request.json()) as RAGQueryRequest;
    const { query, topK = 10, filter = {} } = body;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return createErrorResponse("Query text is required", 400);
    }

    const ragService = await getRAGService();
    const startTime = Date.now();

    const results = await ragService.query(query, {
      topK,
      contentType: filter.contentType || "all",
      filter: {
        postType: filter.postType,
        tags: filter.tags,
      },
    });

    const queryTime = Date.now() - startTime;

    return createSuccessResponse({
      results,
      queryTime,
      count: results.length,
    });
  } catch (error: unknown) {
    console.error("[API RAG Query] Error querying RAG:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Error querying RAG index.", 500, errorMessage);
  }
};
