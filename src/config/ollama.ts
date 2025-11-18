/**
 * Ollama configuration constants
 * Centralized configuration for Ollama HTTP API integration
 */

export const OLLAMA_CONFIG = {
  /**
   * Base URL for Ollama HTTP API
   * Default: http://localhost:11434
   */
  baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",

  /**
   * Default model to use for chat
   * Default: llama3.2
   */
  defaultModel: process.env.OLLAMA_MODEL || "llama3.2",

  /**
   * Request timeout in milliseconds
   * Default: 60 seconds
   */
  timeout: 60000,
} as const;
