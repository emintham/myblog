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

export const GET: APIRoute = async ({ url }) => {
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

  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return new Response(
      JSON.stringify({
        error: "session_id query parameter required",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const messages = getConversation(sessionId);

    return new Response(JSON.stringify({ messages }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[conversations GET] Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to retrieve conversation",
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

export const POST: APIRoute = async ({ request }) => {
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
    const body: Omit<Message, "id" | "created_at"> = await request.json();

    if (!body.session_id || !body.role || !body.content) {
      return new Response(
        JSON.stringify({
          error: "session_id, role, and content are required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!["user", "assistant", "system"].includes(body.role)) {
      return new Response(
        JSON.stringify({
          error: 'role must be "user", "assistant", or "system"',
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const message = addMessage(body);

    return new Response(JSON.stringify({ message }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[conversations POST] Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to add message",
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

export const DELETE: APIRoute = async ({ url }) => {
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

  const sessionId = url.searchParams.get("session_id");

  if (!sessionId) {
    return new Response(
      JSON.stringify({
        error: "session_id query parameter required",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    clearConversation(sessionId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Conversation cleared",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[conversations DELETE] Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to clear conversation",
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
