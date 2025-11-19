import type { APIRoute } from "astro";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../schemas/responses";
import { getRAGService } from "../../services/rag/index";

/**
 * GET /api/rag-stats
 *
 * Returns statistics about the RAG index
 */
export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) {
    return createErrorResponse("Not available in production", 403);
  }

  try {
    const ragService = await getRAGService();
    const stats = await ragService.getStats();

    if (!stats) {
      return createSuccessResponse({
        message: "RAG index not initialized",
        initialized: false,
      });
    }

    return createSuccessResponse({
      initialized: true,
      version: stats.version,
      embeddingModel: stats.embeddingModel,
      embeddingDim: stats.embeddingDim,
      provider: stats.provider,
      stats: stats.stats,
    });
  } catch (error: unknown) {
    console.error("[API RAG Stats] Error fetching RAG stats:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(
      "Error fetching RAG statistics.",
      500,
      errorMessage
    );
  }
};
