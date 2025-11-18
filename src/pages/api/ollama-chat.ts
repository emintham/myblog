/**
 * API endpoint to proxy Ollama chat requests with context injection
 * POST /api/ollama-chat
 *
 * Request body:
 * {
 *   "model": "llama3.2",
 *   "messages": [...],
 *   "contextMode": "current" | "withRAG" | "none",
 *   "currentPost": { title, body },
 *   "stream": false
 * }
 *
 * Returns Ollama chat response
 */

import type { APIRoute } from "astro";
import { ragService } from "../../services/rag/index.js";
import { OLLAMA_CONFIG } from "../../config/ollama";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../../schemas/responses";
import { extractErrorMessage } from "../../utils/api-helpers";
import type { ChatMessage, ContextMode } from "../../types/phase4";

interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  contextMode?: ContextMode;
  currentPost?: {
    title: string;
    body: string;
  };
  stream?: boolean;
}

export const POST: APIRoute = async ({ request }) => {
  // Production guard: disable in production
  if (import.meta.env.PROD) {
    return createErrorResponse("API not available in production", 403);
  }

  try {
    const body: ChatRequest = await request.json();

    const {
      model = OLLAMA_CONFIG.defaultModel,
      messages,
      contextMode = "none",
      currentPost,
      stream = false,
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return createErrorResponse(
        "Invalid request: messages array required",
        400
      );
    }

    // Inject context based on mode
    const contextMessages: ChatMessage[] = [];

    if (contextMode === "current" && currentPost) {
      contextMessages.push({
        role: "system",
        content: `You are an AI writing assistant helping the user write a blog post.

Current post context:
Title: ${currentPost.title || "(Untitled)"}

Body:
${currentPost.body || "(Empty)"}

Provide helpful, concise feedback and suggestions based on this context.`,
      });
    } else if (contextMode === "withRAG" && currentPost) {
      // Get related content via RAG
      const ragResults = await ragService.query(
        currentPost.body || currentPost.title,
        {
          topK: 5,
          contentType: "all",
        }
      );

      const relatedContent = ragResults.results
        .map((r, i) => {
          if (r.metadata.contentType === "post") {
            return `${i + 1}. Post: "${r.metadata.title}" (${r.metadata.slug})
   ${r.content.substring(0, 200)}...`;
          } else {
            return `${i + 1}. Quote from "${r.metadata.bookTitle}"
   ${r.content.substring(0, 200)}...`;
          }
        })
        .join("\n\n");

      contextMessages.push({
        role: "system",
        content: `You are an AI writing assistant helping the user write a blog post.

Current post context:
Title: ${currentPost.title || "(Untitled)"}

Body:
${currentPost.body || "(Empty)"}

Related content from the user's knowledge base:
${relatedContent || "(No related content found)"}

Provide helpful, concise feedback and suggestions. You may reference the related content to suggest connections, quotes, or links the user could add.`,
      });
    }

    // Combine context with user messages
    const finalMessages = [...contextMessages, ...messages];

    // Forward to Ollama
    const ollamaResponse = await fetch(`${OLLAMA_CONFIG.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        stream,
      }),
      signal: AbortSignal.timeout(OLLAMA_CONFIG.timeout),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      return createErrorResponse(
        `Ollama error: ${errorText}`,
        ollamaResponse.status
      );
    }

    // Return Ollama's response
    const data = await ollamaResponse.json();

    return createSuccessResponse(data);
  } catch (error) {
    console.error("[ollama-chat] Error:", error);

    const errorMessage = extractErrorMessage(error);

    return createErrorResponse(
      `Failed to communicate with Ollama: ${errorMessage}`,
      500
    );
  }
};
