/**
 * API endpoint to proxy requests to Lexi text analysis service
 * POST /api/lexi-analyze
 *
 * Request body:
 * - text: string - Text to analyze
 * - metrics: string[] - Metrics to calculate
 *
 * Returns analysis results from Lexi service
 */

import type { APIRoute } from "astro";
import { LEXI_CONFIG } from "../../config/index";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../schemas/responses";
import { extractErrorMessage } from "../../utils/api-helpers";

export const prerender = false;

// Available metrics in Lexi
export const LEXI_METRICS = [
  "vocabulary_diversity",
  "sentence_structure_variety",
  "semantic_pacing_vectors",
  "adverb_usage",
  "sentiment_arc",
  "cognitive_load",
] as const;

export type LexiMetric = (typeof LEXI_METRICS)[number];

interface LexiRequest {
  text: string;
  metrics: LexiMetric[];
  ollama_model?: string;
}

export const POST: APIRoute = async ({ request }) => {
  // Production guard
  if (import.meta.env.PROD) {
    return createErrorResponse("API not available in production", 403);
  }

  try {
    const body = (await request.json()) as LexiRequest;

    console.log("[Lexi API] Received request:");
    console.log("[Lexi API] - text length:", body.text?.length || 0);
    console.log("[Lexi API] - metrics:", body.metrics);
    console.log("[Lexi API] - text preview:", body.text?.substring(0, 100));

    if (!body.text || typeof body.text !== "string") {
      console.log("[Lexi API] Error: Missing or invalid text field");
      return createErrorResponse("Missing or invalid 'text' field", 400);
    }

    if (!body.metrics || !Array.isArray(body.metrics)) {
      return createErrorResponse("Missing or invalid 'metrics' field", 400);
    }

    // Validate metrics
    const invalidMetrics = body.metrics.filter(
      (m) => !LEXI_METRICS.includes(m as LexiMetric)
    );
    if (invalidMetrics.length > 0) {
      return createErrorResponse(
        `Invalid metrics: ${invalidMetrics.join(", ")}. Valid metrics: ${LEXI_METRICS.join(", ")}`,
        400
      );
    }

    // Call Lexi service
    const lexiResponse = await fetch(`${LEXI_CONFIG.baseUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: body.text,
        metrics: body.metrics,
        ollama_model: body.ollama_model || LEXI_CONFIG.ollamaModel,
      }),
      signal: AbortSignal.timeout(LEXI_CONFIG.timeout),
    });

    if (!lexiResponse.ok) {
      const errorText = await lexiResponse.text();
      return createErrorResponse(
        `Lexi service error: ${lexiResponse.status} - ${errorText}`,
        502
      );
    }

    const results = await lexiResponse.json();
    return createSuccessResponse(results);
  } catch (error) {
    const errorMessage = extractErrorMessage(error);

    // Check if it's a connection error
    if (
      errorMessage.includes("ECONNREFUSED") ||
      errorMessage.includes("fetch failed")
    ) {
      return createErrorResponse(
        `Cannot connect to Lexi service at ${LEXI_CONFIG.baseUrl}. Ensure Lexi is running.`,
        503
      );
    }

    return createErrorResponse(`Analysis failed: ${errorMessage}`, 500);
  }
};

// GET endpoint to check Lexi status
export const GET: APIRoute = async () => {
  if (import.meta.env.PROD) {
    return createErrorResponse("API not available in production", 403);
  }

  try {
    // Try to reach Lexi (using a minimal analyze request)
    const response = await fetch(`${LEXI_CONFIG.baseUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "test",
        metrics: ["vocabulary_diversity"],
      }),
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return createSuccessResponse({
        available: true,
        baseUrl: LEXI_CONFIG.baseUrl,
      });
    }

    return createSuccessResponse({
      available: false,
      error: `Lexi responded with status ${response.status}`,
    });
  } catch (error) {
    return createSuccessResponse({
      available: false,
      error: `Cannot connect to Lexi: ${extractErrorMessage(error)}`,
    });
  }
};
