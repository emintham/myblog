import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import { generateSlug } from "../../utils/slugify";
import type { PostApiPayload } from "../../types/admin";
import {
  transformApiPayloadToFrontmatter,
  generatePostFileContent,
} from "../../utils/adminApiHelpers";
import { UpdatePostPayloadSchema } from "../../schemas/api";
import {
  createErrorResponse,
  createSuccessResponse,
  formatZodError,
} from "../../schemas/responses";
import {
  handleDraftToPublishedTransition,
  handleSlugChange,
  checkSlugConflict,
  handleQuotesUpdate,
  handleRAGIndexUpdate,
} from "../../utils/postUpdateHelpers";

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return createErrorResponse(
      "This feature is not available in production",
      403
    );
  }

  let rawPayload: unknown;
  let rawBody: string | undefined;
  try {
    // Try to get the raw body text first for better error reporting
    const bodyText = await request.text();
    rawBody = bodyText;

    if (import.meta.env.DEV) {
      const bodySizeKB = new Blob([bodyText]).size / 1024;
      console.log(
        `[API Update] Received request body size: ${bodySizeKB.toFixed(2)} KB`
      );
      if (bodySizeKB > 1024) {
        console.warn("[API Update] Large request body detected (> 1MB)");
      }
    }

    rawPayload = JSON.parse(bodyText);
  } catch (parseError) {
    if (
      parseError instanceof SyntaxError ||
      (parseError instanceof Error &&
        parseError.message.toLowerCase().includes("json"))
    ) {
      const errorMsg =
        parseError instanceof Error
          ? parseError.message
          : "Unknown parsing error";
      console.error("[API Update] JSON parsing failed:", errorMsg);
      console.error(
        "[API Update] Request headers:",
        Object.fromEntries(request.headers.entries())
      );

      // Log a snippet of the body for debugging (truncate to avoid logging huge bodies)
      if (import.meta.env.DEV && rawBody) {
        const snippet =
          rawBody.length > 200
            ? rawBody.substring(0, 100) +
              "..." +
              rawBody.substring(rawBody.length - 100)
            : rawBody;
        console.error(
          "[API Update] Body snippet (first/last 100 chars):",
          snippet
        );
        console.error("[API Update] Body length:", rawBody.length);

        // Check for common issues
        if (rawBody.endsWith("}") === false) {
          console.error(
            "[API Update] WARNING: Body doesn't end with '}' - likely truncated!"
          );
        }
      }

      return createErrorResponse(
        "Invalid JSON data received for update.",
        400,
        errorMsg
      );
    }
    throw parseError;
  }

  try {
    // Validate payload with Zod
    const validationResult = UpdatePostPayloadSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      return createErrorResponse(
        "Validation failed",
        400,
        formatZodError(validationResult.error)
      );
    }

    let payload: PostApiPayload = validationResult.data;
    const { originalFilePath, originalExtension, title, bodyContent } = payload;

    // Extract original slug from originalFilePath for RAG cleanup
    let originalSlug: string | undefined;
    if (originalFilePath) {
      const basename = path.basename(
        originalFilePath,
        path.extname(originalFilePath)
      );
      originalSlug = basename;
    }

    // Check for draft-to-published transition and bump date if needed
    payload = await handleDraftToPublishedTransition(originalFilePath, payload);

    const currentTitle = title || "untitled"; // Should always have a title from the form
    const newSlug = generateSlug(currentTitle);

    // Check if content contains component imports (requires MDX)
    const hasComponents =
      bodyContent &&
      (bodyContent.includes("import ") ||
        bodyContent.includes("<ResponsiveImage"));

    // Determine the file extension: force .mdx if components detected, otherwise use original or default to .mdx
    const fileExtension = hasComponents
      ? ".mdx"
      : originalExtension ||
        (originalFilePath ? path.extname(originalFilePath) : ".mdx");
    const newFilename = `${newSlug}${fileExtension}`;

    const projectRoot = process.cwd();
    const contentBlogDir = path.join(projectRoot, "src", "content", "blog");
    const newFilePath = path.join(contentBlogDir, newFilename);

    // Check if a different file exists at the new path (potential slug change conflict)
    try {
      await checkSlugConflict(originalFilePath, newFilePath, newFilename);
    } catch (conflictError) {
      if (
        conflictError instanceof Error &&
        conflictError.message.includes("|409")
      ) {
        const [message] = conflictError.message.split("|");
        return createErrorResponse(message, 409);
      }
      throw conflictError;
    }

    const frontmatterObject = await transformApiPayloadToFrontmatter(
      payload,
      true
    ); // Pass true for isUpdate
    const fileContent = generatePostFileContent(
      frontmatterObject,
      payload.bodyContent || "",
      payload.postType,
      false
    );

    await fs.writeFile(newFilePath, fileContent);

    // If the filename/path changed, delete the old file
    await handleSlugChange(originalFilePath, newFilePath);

    // --- Handle Inline Quotes Update ---
    await handleQuotesUpdate(payload, newSlug, projectRoot);
    // --- End Handle Inline Quotes Update ---

    // --- RAG Indexing ---
    await handleRAGIndexUpdate(
      payload,
      frontmatterObject,
      originalSlug,
      newSlug
    );
    // --- End RAG Indexing ---

    return createSuccessResponse({
      message: "Post updated successfully!",
      filename: newFilename,
      path: `/blog/${newSlug}`,
      newSlug: newSlug,
      newFilePath: newFilePath,
      newExtension: fileExtension,
      title: frontmatterObject.title,
    });
  } catch (error: unknown) {
    console.error("[API Update] Error updating post:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Error updating post.", 500, errorMessage);
  }
};
