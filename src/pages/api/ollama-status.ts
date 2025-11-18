/**
 * API endpoint to check Ollama availability
 * GET /api/ollama-status
 *
 * Returns:
 * - { available: true, models: [...] } if Ollama is running
 * - { available: false, error: "..." } if Ollama is not available
 */

import type { APIRoute } from "astro";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export const GET: APIRoute = async () => {
  // Production guard: disable in production
  if (import.meta.env.PROD) {
    return new Response(
      JSON.stringify({
        error: "API not available in production",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    // Try to fetch Ollama's /api/tags endpoint to check availability
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          available: false,
          error: `Ollama responded with status ${response.status}`,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();
    const models = data.models || [];

    return new Response(
      JSON.stringify({
        available: true,
        models: models.map((m: any) => m.name),
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        available: false,
        error: `Cannot connect to Ollama: ${errorMessage}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
