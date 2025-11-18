/**
 * Shared API utility functions
 */

/**
 * Extract error message from unknown error type
 * @param error - Unknown error object
 * @returns Human-readable error message
 */
export function extractErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

/**
 * Create production guard response for development-only APIs
 * @returns Response with 403 status if in production, null otherwise
 */
export function createProductionGuard(): Response | null {
  if (import.meta.env.PROD) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Not available in production",
      }),
      {
        status: 403,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  return null;
}

/**
 * Validate fetch response and throw on error
 * @param response - Fetch response object
 * @param context - Context string for error message
 * @throws Error if response is not ok
 */
export async function validateFetchResponse(
  response: Response,
  context: string = "Request"
): Promise<void> {
  if (!response.ok) {
    throw new Error(`${context} failed: ${response.statusText}`);
  }
}

/**
 * Create fetch with timeout using AbortSignal
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds (default: 60000)
 * @returns Promise resolving to Response
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 60000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
