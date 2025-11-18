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

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  contextMode?: "current" | "withRAG" | "none";
  currentPost?: {
    title: string;
    body: string;
  };
  stream?: boolean;
}

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
    const body: ChatRequest = await request.json();

    const {
      model = DEFAULT_MODEL,
      messages,
      contextMode = "none",
      currentPost,
      stream = false,
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: "Invalid request: messages array required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Inject context based on mode
    let contextMessages: ChatMessage[] = [];

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
      const ragResults = await ragService.query(currentPost.body || currentPost.title, {
        topK: 5,
        contentType: "all",
      });

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
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: finalMessages,
        stream,
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      return new Response(
        JSON.stringify({
          error: `Ollama error: ${errorText}`,
        }),
        {
          status: ollamaResponse.status,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return Ollama's response
    const data = await ollamaResponse.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[ollama-chat] Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({
        error: `Failed to communicate with Ollama: ${errorMessage}`,
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
