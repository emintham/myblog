/**
 * Hook for managing Ollama chat interactions
 * Handles sending messages, receiving responses, and managing conversation state
 */

import { useState, useCallback, useEffect } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OllamaChatOptions {
  model?: string;
  contextMode?: "current" | "withRAG" | "none";
  currentPost?: {
    title: string;
    body: string;
  };
}

interface OllamaStatus {
  available: boolean;
  models?: string[];
  error?: string;
}

export function useOllamaChat(sessionId: string, options: OllamaChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);

  // Load conversation history on mount
  useEffect(() => {
    const loadConversation = async () => {
      try {
        const response = await fetch(`/api/conversations?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json();

        if (data.messages) {
          setMessages(
            data.messages.map((m: any) => ({
              role: m.role,
              content: m.content,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load conversation:", err);
      }
    };

    loadConversation();
  }, [sessionId]);

  // Check Ollama status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/ollama-status");
        const data = await response.json();
        setOllamaStatus(data);
      } catch (err) {
        setOllamaStatus({
          available: false,
          error: "Failed to check Ollama status",
        });
      }
    };

    checkStatus();
  }, []);

  /**
   * Send a message to Ollama and get a response
   */
  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim()) return;

      setIsLoading(true);
      setError(null);

      // Add user message to local state
      const newUserMessage: Message = {
        role: "user",
        content: userMessage,
      };

      const updatedMessages = [...messages, newUserMessage];
      setMessages(updatedMessages);

      try {
        // Save user message to database
        await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            role: "user",
            content: userMessage,
          }),
        });

        // Send to Ollama
        const response = await fetch("/api/ollama-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: options.model,
            messages: updatedMessages,
            contextMode: options.contextMode || "none",
            currentPost: options.currentPost,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to get response from Ollama");
        }

        const data = await response.json();

        if (!data.message || !data.message.content) {
          throw new Error("Invalid response from Ollama");
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: data.message.content,
        };

        // Add assistant message to state
        setMessages([...updatedMessages, assistantMessage]);

        // Save assistant message to database
        await fetch("/api/conversations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            role: "assistant",
            content: data.message.content,
          }),
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("[useOllamaChat] Error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, sessionId, options]
  );

  /**
   * Clear the conversation history
   */
  const clearConversation = useCallback(async () => {
    try {
      await fetch(`/api/conversations?session_id=${encodeURIComponent(sessionId)}`, {
        method: "DELETE",
      });

      setMessages([]);
      setError(null);
    } catch (err) {
      console.error("Failed to clear conversation:", err);
    }
  }, [sessionId]);

  return {
    messages,
    isLoading,
    error,
    ollamaStatus,
    sendMessage,
    clearConversation,
  };
}
