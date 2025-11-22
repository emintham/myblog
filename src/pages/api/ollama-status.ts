/**
 * API endpoint to check Ollama availability
 * GET /api/ollama-status
 *
 * Returns:
 * - { available: true, models: [...] } if Ollama is running
 * - { available: false, error: "..." } if Ollama is not available
 */

import type { APIRoute } from "astro";
import { OLLAMA_CONFIG } from "../../config/index";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../schemas/responses";
import { extractErrorMessage } from "../../utils/api-helpers";

// Mark as server-rendered endpoint (required for POST requests in dev mode)
export const prerender = false;

export const GET: APIRoute = async () => {
  // Production guard: disable in production
  if (import.meta.env.PROD) {
    return createErrorResponse("API not available in production", 403);
  }

  try {
    // Try to fetch Ollama's /api/tags endpoint to check availability
    const response = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return createSuccessResponse({
        available: false,
        error: `Ollama responded with status ${response.status}`,
      });
    }

    const data = await response.json();
    const models = data.models || [];

    return createSuccessResponse({
      available: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      models: models.map((m: any) => m.name),
    });
  } catch (error) {
    const errorMessage = extractErrorMessage(error);

    return createSuccessResponse({
      available: false,
      error: `Cannot connect to Ollama: ${errorMessage}`,
    });
  }
};
