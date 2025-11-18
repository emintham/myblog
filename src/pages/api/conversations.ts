/**
 * API endpoint for conversation history CRUD operations
 * GET /api/conversations?session_id=...  - Get conversation
 * POST /api/conversations                - Add message
 * DELETE /api/conversations?session_id=... - Clear conversation
 */

import type { APIRoute } from "astro";
import {
  getConversation,
  addMessage,
  clearConversation,
  type Message,
} from "../../services/db.js";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../schemas/responses";

export const GET: APIRoute = async ({ url }) => {
  // Production guard: disable in production
  if (import.meta.env.PROD) {
    return createErrorResponse("API not available in production", 403);
  }

  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return createErrorResponse("session_id query parameter required", 400);
  }

  try {
    const messages = getConversation(sessionId);

    return createSuccessResponse({ messages });
  } catch (error) {
    console.error("[conversations GET] Error:", error);

    return createErrorResponse("Failed to retrieve conversation", 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  // Production guard: disable in production
  if (import.meta.env.PROD) {
    return createErrorResponse("API not available in production", 403);
  }

  try {
    const body: Omit<Message, "id" | "created_at"> = await request.json();

    if (!body.session_id || !body.role || !body.content) {
      return createErrorResponse(
        "session_id, role, and content are required",
        400
      );
    }

    if (!["user", "assistant", "system"].includes(body.role)) {
      return createErrorResponse(
        'role must be "user", "assistant", or "system"',
        400
      );
    }

    const message = addMessage(body);

    return createSuccessResponse({ message }, 201);
  } catch (error) {
    console.error("[conversations POST] Error:", error);

    return createErrorResponse("Failed to add message", 500);
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  // Production guard: disable in production
  if (import.meta.env.PROD) {
    return createErrorResponse("API not available in production", 403);
  }

  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return createErrorResponse("session_id query parameter required", 400);
  }

  try {
    clearConversation(sessionId);

    return createSuccessResponse({
      success: true,
      message: "Conversation cleared",
    });
  } catch (error) {
    console.error("[conversations DELETE] Error:", error);

    return createErrorResponse("Failed to clear conversation", 500);
  }
};
