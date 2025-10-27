// src/schemas/responses.ts
import { z } from "zod";

/**
 * Schema for error responses
 */
export const ErrorResponseSchema = z.object({
  message: z.string(),
  errorDetail: z.unknown().optional(),
  status: z.number().optional(),
});

/**
 * Schema for successful post creation/update responses
 */
export const PostSuccessResponseSchema = z.object({
  message: z.string(),
  filename: z.string(),
  path: z.string(),
  newSlug: z.string().optional(),
  newFilePath: z.string().optional(),
  newExtension: z.string().optional(),
  quotesRef: z.string().optional(),
  title: z.string(),
});

/**
 * Schema for successful deletion responses
 */
export const DeleteSuccessResponseSchema = z.object({
  message: z.string(),
  slug: z.string().optional(),
  quotesRef: z.string().optional(),
});

// Export inferred types
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type PostSuccessResponse = z.infer<typeof PostSuccessResponseSchema>;
export type DeleteSuccessResponse = z.infer<typeof DeleteSuccessResponseSchema>;

/**
 * Helper function to create standardized error responses
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  errorDetail?: unknown
): Response {
  const body: ErrorResponse = {
    message,
    status,
    ...(errorDetail && { errorDetail }),
  };

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Helper function to create standardized success responses
 */
export function createSuccessResponse<T extends Record<string, unknown>>(
  data: T,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Helper function to format Zod validation errors
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");
}
