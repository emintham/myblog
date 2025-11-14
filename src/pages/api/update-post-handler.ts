import type { APIRoute } from "astro";
import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
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


export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return createErrorResponse(
      "This feature is not available in production",
      403
    );
  }

  try {
    const rawPayload = await request.json();

    // Validate payload with Zod
    const validationResult = UpdatePostPayloadSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      return createErrorResponse(
        "Validation failed",
        400,
        formatZodError(validationResult.error)
      );
    }

    const payload: PostApiPayload = validationResult.data;
    const { originalFilePath, originalExtension, title } = payload;

    const currentTitle = title || "untitled"; // Should always have a title from the form
    const newSlug = generateSlug(currentTitle);
    // Determine the file extension: use original, or derive from originalFilePath, or default to .mdx
    const fileExtension =
      originalExtension ||
      (originalFilePath ? path.extname(originalFilePath) : ".mdx");
    const newFilename = `${newSlug}${fileExtension}`;

    const projectRoot = process.cwd();
    const contentBlogDir = path.join(projectRoot, "src", "content", "blog");
    const newFilePath = path.join(contentBlogDir, newFilename);

    // Check if a different file exists at the new path (potential slug change conflict)
    if (newFilePath !== originalFilePath) {
      try {
        await fs.access(newFilePath);
        // If fs.access doesn't throw, a file exists at the new path, which is a conflict
        return createErrorResponse(
          `Cannot update post. A different file already exists with the new title/slug: ${newFilename}. Please choose a different title or resolve the conflict.`,
          409
        );
      } catch {
        // File does not exist at newFilePath, safe to proceed with rename/move.
      }
    }

    const frontmatterObject = await transformApiPayloadToFrontmatter(payload); // Await the promise
    const fileContent = generatePostFileContent(
      frontmatterObject,
      payload.bodyContent || "",
      payload.postType,
      false
    );

    await fs.writeFile(newFilePath, fileContent);

    // If the filename/path changed, delete the old file
    if (newFilePath !== originalFilePath && originalFilePath) {
      try {
        await fs.access(originalFilePath); // Check if old file actually exists before unlinking
        await fs.unlink(originalFilePath);
        if (import.meta.env.DEV) {
          console.log(
            `[API Update] Successfully deleted old file: ${originalFilePath}`
          );
        }
      } catch (err) {
        // Log a warning if the old file couldn't be deleted, but don't fail the whole operation
        // as the new file has been successfully written.
        const errMessage = err instanceof Error ? err.message : "Unknown error";
        console.warn(
          `[API Update] Could not delete old file at ${originalFilePath} (it might have been already moved/deleted or permissions issue): ${errMessage}`
        );
      }
    }

    // --- Handle Inline Quotes Update ---
    if (
      payload.postType === "bookNote" &&
      payload.quotesRef &&
      payload.inlineQuotes !== undefined
    ) {
      const quotesDir = path.join(projectRoot, "src", "content", "bookQuotes");
      const quotesFilePath = path.join(quotesDir, `${payload.quotesRef}.yaml`);

      // Ensure the bookQuotes directory exists
      try {
        await fs.mkdir(quotesDir, { recursive: true });
      } catch (mkdirError) {
        console.error(
          `[API Update] Error creating bookQuotes directory ${quotesDir}:`,
          mkdirError
        );
        // Potentially return an error or log and continue without saving quotes
        // For now, we'll log and attempt to write, which might fail if dir doesn't exist.
      }

      const quotesToSave = payload.inlineQuotes.map((q) => ({
        text: q.text,
        quoteAuthor: q.quoteAuthor,
        tags: q.tags,
        quoteSource: q.quoteSource,
        // Client-side 'id' is not saved
      }));

      const yamlData = {
        bookSlug: newSlug, // Use the new slug of the post
        quotes: quotesToSave,
      };

      try {
        const yamlString = yaml.dump(yamlData);
        await fs.writeFile(quotesFilePath, yamlString);
        if (import.meta.env.DEV) {
          console.log(
            `[API Update] Successfully updated quotes file: ${quotesFilePath}`
          );
        }
      } catch (quoteError) {
        console.error(
          `[API Update] Error writing quotes file ${quotesFilePath}:`,
          quoteError
        );
        // Decide if this should be a critical error. For now, log and continue.
        // The main post was updated, but quotes might be out of sync.
        // Could add a warning to the response message.
      }
    }
    // --- End Handle Inline Quotes Update ---

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
    if (
      error instanceof SyntaxError &&
      error.message.toLowerCase().includes("json")
    ) {
      console.error("[API Update] Error parsing JSON body:", error);
      return createErrorResponse(
        "Invalid JSON data received for update.",
        400,
        error.message
      );
    }

    console.error("[API Update] Error updating post:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Error updating post.", 500, errorMessage);
  }
};
