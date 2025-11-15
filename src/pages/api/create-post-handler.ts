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

// Mark as server-rendered endpoint (required for POST requests in dev mode)
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return createErrorResponse("Not available in production", 403);
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
        `[API Create] Received request body size: ${bodySizeKB.toFixed(2)} KB`
      );
      if (bodySizeKB > 1024) {
        console.warn("[API Create] Large request body detected (> 1MB)");
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
      console.error("[API Create] JSON parsing failed:", errorMsg);
      console.error(
        "[API Create] Request headers:",
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
          "[API Create] Body snippet (first/last 100 chars):",
          snippet
        );
        console.error("[API Create] Body length:", rawBody.length);

        // Check for common issues
        if (rawBody.endsWith("}") === false) {
          console.error(
            "[API Create] WARNING: Body doesn't end with '}' - likely truncated!"
          );
        }
      }

      return createErrorResponse("Invalid JSON data received.", 400, errorMsg);
    }
    throw parseError;
  }

  try {
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
    console.error("[API Create] Error creating post:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse("Error creating post.", 500, errorMessage);
  }
};
