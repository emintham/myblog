/**
 * API endpoint to load prompt library
 * GET /api/prompts
 *
 * Returns array of available prompts from prompts.yaml
 */

import type { APIRoute } from "astro";
import { loadPrompts } from "../../utils/prompts.js";

// Mark as server-rendered endpoint (required for POST requests in dev mode)
export const prerender = false;

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
    const prompts = loadPrompts();

    return new Response(JSON.stringify({ prompts }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[prompts] Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to load prompts",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
