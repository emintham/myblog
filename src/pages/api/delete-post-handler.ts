import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { getEntryBySlug } from "astro:content";
import { DeletePostPayloadSchema } from "../../schemas/api";
import {
  createErrorResponse,
  createSuccessResponse,
  formatZodError,
} from "../../schemas/responses";

// Mark as server-rendered endpoint (required for POST requests in dev mode)
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return createErrorResponse("Not available in production", 403);
  }

  try {
    const rawPayload = await request.json();

    // Validate payload with Zod
    const validationResult = DeletePostPayloadSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      return createErrorResponse(
        "Validation failed",
        400,
        formatZodError(validationResult.error)
      );
    }

    const { slug } = validationResult.data;

    const projectRoot = process.cwd();
    const postEntry = await getEntryBySlug("blog", slug);

    if (!postEntry) {
      return createErrorResponse(`Post with slug '${slug}' not found`, 404);
    }

    // Astro's `postEntry.id` for markdown/mdx files is the filename (e.g., `my-post.mdx`)
    // For content collections, the `id` is the relative path from `src/content/collectionName/`
    const filePath = path.join(
      projectRoot,
      "src",
      "content",
      "blog",
      postEntry.id
    );

    try {
      await fs.access(filePath); // Check if file exists before attempting to delete
    } catch {
      // This case should ideally be caught by getEntryBySlug not finding the post,
      // but as a safeguard:
      return createErrorResponse(
        `File not found for slug '${slug}' at path ${filePath}`,
        404
      );
    }

    await fs.unlink(filePath);

    let quotesMessage = "";
    // Check if it's a bookNote and has quotesRef
    if (postEntry.data.postType === "bookNote" && postEntry.data.quotesRef) {
      const quotesFileName = `${postEntry.data.quotesRef}.yaml`;
      const quotesFilePath = path.join(
        projectRoot,
        "src",
        "content",
        "bookQuotes",
        quotesFileName
      );
      try {
        await fs.access(quotesFilePath);
        await fs.unlink(quotesFilePath);
        quotesMessage = ` Also deleted associated quotes file: ${quotesFileName}`;
      } catch (quoteError) {
        // Log if the quotes file doesn't exist or couldn't be deleted, but don't fail the whole operation
        const errMessage =
          quoteError instanceof Error ? quoteError.message : "Unknown error";
        console.warn(
          `[API Delete] Could not delete quotes file ${quotesFilePath}: ${errMessage}`
        );
        quotesMessage = ` Could not delete associated quotes file: ${quotesFileName} (may not exist or permissions issue).`;
      }
    }

    return createSuccessResponse({
      message: `Post '${slug}' deleted successfully.${quotesMessage}`,
      slug,
      ...(postEntry.data.quotesRef && { quotesRef: postEntry.data.quotesRef }),
    });
  } catch (error: unknown) {
    console.error("[API Delete] Error deleting post:", error);

    if (
      error instanceof SyntaxError &&
      error.message.toLowerCase().includes("json")
    ) {
      return createErrorResponse(
        "Invalid JSON data in request body.",
        400,
        error.message
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Error deleting post.", 500, errorMessage);
  }
};
