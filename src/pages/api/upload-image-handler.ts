// src/pages/api/upload-image-handler.ts
import type { APIRoute } from "astro";
import fs from "fs-extra";
import path from "path";
import sharp from "sharp";
import { createErrorResponse } from "../../schemas/responses";

export const prerender = false;

const TARGET_WIDTHS = [100, 150, 200, 480, 800, 1200, 1600, 1920].sort(
  (a, b) => a - b
);
const WEBP_QUALITY = 75;
const JPG_QUALITY = 80;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Production environment guard
if (import.meta.env.PROD) {
  console.warn("Image upload handler is disabled in production.");
}

async function processImageWidth(
  imageInstance: sharp.Sharp,
  width: number,
  imageName: string,
  outputDir: string
): Promise<void> {
  const outputFileNameWebP = `${imageName}-${width}w.webp`;
  const outputPathWebP = path.join(outputDir, outputFileNameWebP);
  const outputFileNameJpg = `${imageName}-${width}w.jpg`;
  const outputPathJpg = path.join(outputDir, outputFileNameJpg);

  // Create WebP variant
  if (!(await fs.pathExists(outputPathWebP))) {
    await imageInstance
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(outputPathWebP);
  }

  // Create JPG variant
  if (!(await fs.pathExists(outputPathJpg))) {
    await imageInstance
      .clone()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: JPG_QUALITY, progressive: true })
      .toFile(outputPathJpg);
  }
}

export const POST: APIRoute = async ({ request }) => {
  // Production guard
  if (import.meta.env.PROD) {
    return createErrorResponse("Not available in production", 403);
  }

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const customFilename = formData.get("filename") as string | null;

    // Validate required fields
    if (!imageFile) {
      return createErrorResponse("No image file provided", 400);
    }

    if (!customFilename || customFilename.trim() === "") {
      return createErrorResponse("No filename provided", 400);
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return createErrorResponse(
        `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        400
      );
    }

    // Validate file size
    if (imageFile.size > MAX_FILE_SIZE) {
      return createErrorResponse(
        `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
        400
      );
    }

    // Sanitize filename (remove special chars, convert spaces to hyphens)
    const sanitizedFilename = customFilename
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!sanitizedFilename) {
      return createErrorResponse("Invalid filename after sanitization", 400);
    }

    // Determine file extension from original file
    const originalExtension = path.extname(imageFile.name).toLowerCase();
    const extension = originalExtension || ".jpg";

    // Define paths
    const projectRoot = process.cwd();
    const originalsDir = path.join(projectRoot, "images", "originals");
    const processedDir = path.join(
      projectRoot,
      "public",
      "images",
      "processed"
    );
    const originalFilePath = path.join(
      originalsDir,
      `${sanitizedFilename}${extension}`
    );

    // Ensure directories exist
    await fs.ensureDir(originalsDir);
    await fs.ensureDir(processedDir);

    // Check if file already exists
    if (await fs.pathExists(originalFilePath)) {
      return createErrorResponse(
        `Image with filename "${sanitizedFilename}${extension}" already exists`,
        409
      );
    }

    // Save original file
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(originalFilePath, buffer);

    // Process image with Sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const originalWidth = metadata.width;

    if (!originalWidth) {
      // Cleanup on error
      await fs.remove(originalFilePath);
      return createErrorResponse("Could not read image metadata", 500);
    }

    // Process responsive variants
    const processedWidths = new Set<number>();

    for (const targetWidth of TARGET_WIDTHS) {
      if (targetWidth <= originalWidth) {
        await processImageWidth(
          image,
          targetWidth,
          sanitizedFilename,
          processedDir
        );
        processedWidths.add(targetWidth);
      }
    }

    // Process original width if not in target widths
    if (originalWidth > 0 && !processedWidths.has(originalWidth)) {
      await processImageWidth(
        image,
        originalWidth,
        sanitizedFilename,
        processedDir
      );
    }

    // Return success response with image metadata
    return new Response(
      JSON.stringify({
        message: "Image uploaded and processed successfully",
        filename: `${sanitizedFilename}${extension}`,
        imageName: sanitizedFilename,
        originalWidth,
        path: `/images/processed/${sanitizedFilename}-${originalWidth}w.jpg`,
        alt: sanitizedFilename.replace(/-/g, " "),
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return createErrorResponse(
      "Failed to upload image",
      500,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};
