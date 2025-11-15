// src/types/api.ts

import type { PostFormData, PostSourceData } from "./admin";

/**
 * Represents the structured data for a successful API response.
 * This is typically sent back to the client after a create or update operation.
 */
export interface ApiSuccessResponse extends Partial<PostSourceData> {
  message: string;
  // The web path to the new or updated post (e.g., /blog/my-new-post)
  path?: string;
  // The new slug, useful if the slug was changed on the server
  newSlug?: string;
  // The new file path, useful for updating client-side state
  newFilePath?: string;
  newExtension?: string;
}

/**
 * Represents the structured data for an API error response.
 */
export interface ApiErrorResponse {
  message: string;
  // Optionally, include the original error stack in development
  stack?: string;
  // A specific error code for client-side logic
  code?: string;
}
