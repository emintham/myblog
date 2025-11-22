import fs from "node:fs/promises";
import path from "node:path";
import yaml from "js-yaml";
import matter from "gray-matter";
import type { PostApiPayload } from "../types/admin";
import { getRAGService } from "../services/rag/index";

/**
 * Checks if a post is transitioning from draft to published status
 * and updates the pubDate to today if needed.
 *
 * @param originalFilePath - Path to the original post file
 * @param payload - The post API payload
 * @returns Updated payload with bumped pubDate if transitioning from draft to published
 */
export async function handleDraftToPublishedTransition(
  originalFilePath: string | undefined,
  payload: PostApiPayload
): Promise<PostApiPayload> {
  if (!originalFilePath) {
    return payload;
  }

  try {
    const existingContent = await fs.readFile(originalFilePath, "utf-8");
    const parsed = matter(existingContent);
    const existingDraft = parsed.data.draft === true;
    const newDraft =
      payload.draft === true ||
      payload.draft === "on" ||
      (typeof payload.draft === "string" &&
        payload.draft.toLowerCase() === "true");

    // If transitioning from draft to published, bump the date to today
    if (existingDraft && !newDraft) {
      const today = new Date();
      const updatedPayload = { ...payload };
      updatedPayload.pubDate = today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      if (import.meta.env.DEV) {
        console.log(
          `[API Update] Post transitioning from draft to published, updating pubDate to ${updatedPayload.pubDate}`
        );
      }
      return updatedPayload;
    }
  } catch (readError) {
    // If we can't read the original file, just log and continue
    // This might happen if the file was moved or deleted
    if (import.meta.env.DEV) {
      console.warn(
        `[API Update] Could not read original file to check draft status: ${readError}`
      );
    }
  }

  return payload;
}

/**
 * Handles file rename/move when the slug changes.
 * Deletes the old file after successfully writing the new one.
 *
 * @param originalFilePath - Path to the original post file
 * @param newFilePath - Path to the new post file
 * @returns true if file was renamed/deleted, false if no action taken
 */
export async function handleSlugChange(
  originalFilePath: string | undefined,
  newFilePath: string
): Promise<boolean> {
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
      return true;
    } catch (err) {
      // Log a warning if the old file couldn't be deleted, but don't fail the whole operation
      // as the new file has been successfully written.
      const errMessage = err instanceof Error ? err.message : "Unknown error";
      console.warn(
        `[API Update] Could not delete old file at ${originalFilePath} (it might have been already moved/deleted or permissions issue): ${errMessage}`
      );
      return false;
    }
  }
  return false;
}

/**
 * Checks if a file exists at the new path and throws an error if it's a different file.
 * This prevents accidentally overwriting an existing post when the slug changes.
 *
 * @param originalFilePath - Path to the original post file
 * @param newFilePath - Path to the new post file
 * @param newFilename - Name of the new file (for error message)
 * @throws Error with 409 status code if conflict detected
 */
export async function checkSlugConflict(
  originalFilePath: string | undefined,
  newFilePath: string,
  newFilename: string
): Promise<void> {
  // Check if a different file exists at the new path (potential slug change conflict)
  if (newFilePath !== originalFilePath) {
    try {
      await fs.access(newFilePath);
      // If fs.access doesn't throw, a file exists at the new path, which is a conflict
      throw new Error(
        `Cannot update post. A different file already exists with the new title/slug: ${newFilename}. Please choose a different title or resolve the conflict.|409`
      );
    } catch (err) {
      // Re-throw if it's our custom conflict error
      if (
        err instanceof Error &&
        err.message.includes("already exists with the new title/slug")
      ) {
        throw err;
      }
      // Otherwise, file does not exist at newFilePath, safe to proceed with rename/move.
    }
  }
}

/**
 * Updates the quotes YAML file for a book note post.
 *
 * @param payload - The post API payload
 * @param newSlug - The new slug of the post
 * @param projectRoot - The project root directory
 */
export async function handleQuotesUpdate(
  payload: PostApiPayload,
  newSlug: string,
  projectRoot: string
): Promise<void> {
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
}

/**
 * Updates the RAG index for the updated post.
 * Handles slug changes by deleting the old entry and creating a new one.
 *
 * @param payload - The post API payload
 * @param frontmatterObject - The transformed frontmatter object
 * @param originalSlug - The original slug (if slug changed)
 * @param newSlug - The new slug of the post
 */
export async function handleRAGIndexUpdate(
  payload: PostApiPayload,
  frontmatterObject: Record<string, unknown>,
  originalSlug: string | undefined,
  newSlug: string
): Promise<void> {
  try {
    const ragService = await getRAGService();

    // If slug changed, delete old index entry
    if (originalSlug && originalSlug !== newSlug) {
      await ragService.deletePost(originalSlug);
      if (import.meta.env.DEV) {
        console.log(`[RAG] Deleted old post from index: ${originalSlug}`);
      }
    }

    // Index the updated post content
    await ragService.upsertPost(newSlug, {
      title: frontmatterObject.title as string,
      content: payload.bodyContent || "",
      postType: payload.postType,
      tags: frontmatterObject.tags as string[],
      series: frontmatterObject.series as string | undefined,
      pubDate: frontmatterObject.pubDate as string,
    });

    // Index book quotes if this is a book note
    if (
      payload.postType === "bookNote" &&
      payload.quotesRef &&
      payload.inlineQuotes !== undefined
    ) {
      const quotes = payload.inlineQuotes.map((q) => ({
        text: q.text,
        tags: q.tags,
        quoteAuthor: q.quoteAuthor,
        quoteSource: q.quoteSource,
      }));

      await ragService.upsertQuotes(payload.quotesRef, quotes, {
        bookTitle: (frontmatterObject.bookTitle as string) || "Unknown",
        bookAuthor: (frontmatterObject.bookAuthor as string) || "Unknown",
      });
    }

    if (import.meta.env.DEV) {
      console.log(`[RAG] Successfully indexed updated post: ${newSlug}`);
    }
  } catch (ragError) {
    // Log but don't fail the request if RAG indexing fails
    console.error(`[RAG] Failed to index updated post ${newSlug}:`, ragError);
  }
}
