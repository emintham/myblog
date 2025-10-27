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
import { CreatePostPayloadSchema } from "../../schemas/api";
import {
  createErrorResponse,
  createSuccessResponse,
  formatZodError,
} from "../../schemas/responses";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return createErrorResponse("Not available in production", 403);
  }

  try {
    const rawPayload = await request.json();

    // Validate payload with Zod
    const validationResult = CreatePostPayloadSchema.safeParse(rawPayload);

    if (!validationResult.success) {
      return createErrorResponse(
        "Validation failed",
        400,
        formatZodError(validationResult.error)
      );
    }

    const payload: PostApiPayload = validationResult.data;

    const slug = generateSlug(payload.title || "untitled");
    const filename = `${slug}.mdx`; // Default to mdx for new posts
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, "src", "content", "blog", filename);

    try {
      await fs.access(filePath);
      return createErrorResponse(
        `File already exists: ${filename}. Please use a different title.`,
        409
      );
    } catch {
      // File does not exist, proceed with creation
    }

    const frontmatterObject = await transformApiPayloadToFrontmatter(payload); // Await the promise
    let generatedQuotesRef: string | undefined = undefined;

    // --- Handle Inline Quotes for New BookNote ---
    if (payload.postType === "bookNote") {
      generatedQuotesRef = `${slug}-quotes`;
      frontmatterObject.quotesRef = generatedQuotesRef; // Add to frontmatter BEFORE generating post content

      const quotesDir = path.join(projectRoot, "src", "content", "bookQuotes");
      const quotesFilePath = path.join(quotesDir, `${generatedQuotesRef}.yaml`);

      try {
        await fs.mkdir(quotesDir, { recursive: true });
      } catch (mkdirError) {
        console.error(
          `[API Create] Error creating bookQuotes directory ${quotesDir}:`,
          mkdirError
        );
        // Potentially return an error or log and continue without saving quotes
      }

      const quotesToSave = (payload.inlineQuotes || []).map((q) => ({
        text: q.text,
        quoteAuthor: q.quoteAuthor,
        tags: q.tags,
        quoteSource: q.quoteSource,
      }));

      const yamlData = {
        bookSlug: slug, // The slug of the post itself
        quotes: quotesToSave, // Will be an empty array if no inlineQuotes provided
      };

      try {
        const yamlString = yaml.dump(yamlData);
        await fs.writeFile(quotesFilePath, yamlString);
        if (import.meta.env.DEV) {
          console.log(
            `[API Create] Successfully created quotes file: ${quotesFilePath}`
          );
        }
      } catch (quoteError) {
        console.error(
          `[API Create] Error writing quotes file ${quotesFilePath}:`,
          quoteError
        );
        // Decide if this should be a critical error.
        // Could add a warning to the response message.
      }
    }
    // --- End Handle Inline Quotes ---

    const fileContent = generatePostFileContent(
      frontmatterObject,
      payload.bodyContent || "",
      payload.postType,
      true
    );

    await fs.writeFile(filePath, fileContent);

    const responsePayload = {
      message: "Post created successfully!",
      filename: filename,
      path: `/blog/${slug}`,
      newSlug: slug,
      title: frontmatterObject.title,
      ...(generatedQuotesRef && { quotesRef: generatedQuotesRef }),
    };

    return createSuccessResponse(responsePayload, 201);
  } catch (error: unknown) {
    if (
      error instanceof SyntaxError &&
      error.message.toLowerCase().includes("json")
    ) {
      console.error("[API Create] Error parsing JSON body:", error);
      return createErrorResponse(
        "Invalid JSON data received.",
        400,
        error.message
      );
    }

    console.error("[API Create] Error creating post:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Error creating post.", 500, errorMessage);
  }
};
