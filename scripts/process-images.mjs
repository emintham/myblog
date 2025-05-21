// scripts/process-images.mjs
import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const SOURCE_DIR = path.join(__dirname, "..", "images", "originals"); // Source for original images
const OUTPUT_DIR = path.join(__dirname, "..", "public", "images", "processed");

const TARGET_WIDTHS = [100, 150, 200, 480, 800, 1200, 1600, 1920].sort(
  (a, b) => a - b
);

const WEBP_QUALITY = 75;
const JPG_QUALITY = 80;

async function processImageWidth(
  imageInstance,
  width,
  imageName,
  imageExtension,
  isOriginal = false
) {
  // For the actual original width version, we just use the width in the filename.
  // For other target widths, it's also just the width.
  const actualWidthToProcess = width;

  const outputFileNameWebP = `${imageName}-${actualWidthToProcess}w.webp`;
  const outputPathWebP = path.join(OUTPUT_DIR, outputFileNameWebP);
  const outputFileNameJpg = `${imageName}-${actualWidthToProcess}w.jpg`;
  const outputPathJpg = path.join(OUTPUT_DIR, outputFileNameJpg);

  try {
    if (!(await fs.pathExists(outputPathWebP))) {
      await imageInstance
        .clone() // Use clone for each distinct processing pipeline
        .resize({ width: actualWidthToProcess, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outputPathWebP);
      console.log(`  ✓ Created: ${outputFileNameWebP}`);
    } else {
      // console.log(`  → Skipped (exists): ${outputFileNameWebP}`);
    }
  } catch (err) {
    console.error(
      `  ✗ Error creating WebP for ${imageName}${imageExtension} at ${actualWidthToProcess}w:`,
      err
    );
  }

  try {
    if (!(await fs.pathExists(outputPathJpg))) {
      await imageInstance
        .clone()
        .resize({ width: actualWidthToProcess, withoutEnlargement: true })
        .jpeg({ quality: JPG_QUALITY, progressive: true })
        .toFile(outputPathJpg);
      console.log(`  ✓ Created: ${outputFileNameJpg}`);
    } else {
      // console.log(`  → Skipped (exists): ${outputFileNameJpg}`);
    }
  } catch (err) {
    console.error(
      `  ✗ Error creating JPG for ${imageName}${imageExtension} at ${actualWidthToProcess}w:`,
      err
    );
  }
}

async function processImages() {
  console.log(`Starting image processing...`);
  console.log(`Source directory: ${SOURCE_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}`);

  try {
    await fs.ensureDir(OUTPUT_DIR);
    const imagePaths = await glob(
      `${SOURCE_DIR}/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}`
    );

    if (imagePaths.length === 0) {
      console.log("No images found in the source directory. Exiting.");
      return;
    }
    console.log(`Found ${imagePaths.length} image(s) to process.`);

    for (const imagePath of imagePaths) {
      const imageNameWithExt = path.basename(imagePath);
      const imageExtension = path.parse(imageNameWithExt).ext;
      const imageName = path.parse(imageNameWithExt).name; // This is the 'imageName' for frontmatter
      console.log(
        `\nProcessing: ${imageNameWithExt} (use imageName: "${imageName}")`
      );

      const image = sharp(imagePath);
      const metadata = await image.metadata();
      const originalWidth = metadata.width;

      if (!originalWidth) {
        console.log(
          `  Skipping ${imageNameWithExt}: could not read metadata (width).`
        );
        continue;
      }

      // Output the line for frontmatter
      console.log(
        `  ➡️ For frontmatter (e.g., in bookCover): originalWidth: ${originalWidth}`
      );

      const processedTargetWidths = new Set();

      // Process defined target widths that are <= originalWidth
      for (const targetWidth of TARGET_WIDTHS) {
        if (targetWidth <= originalWidth) {
          await processImageWidth(
            image,
            targetWidth,
            imageName,
            imageExtension
          );
          processedTargetWidths.add(targetWidth);
        } else {
          // console.log(`  Skipping target width ${targetWidth}w: larger than original (${originalWidth}w).`);
        }
      }

      // Ensure the original width is processed if it's not one of the target widths
      // and is a valid width. This guarantees the original resolution version is available.
      if (originalWidth > 0 && !processedTargetWidths.has(originalWidth)) {
        console.log(`  Processing at original image width: ${originalWidth}w`);
        await processImageWidth(
          image,
          originalWidth,
          imageName,
          imageExtension,
          true
        );
      }
    }
    console.log("\nImage processing completed successfully!");
    console.log(
      "Remember to add the 'originalWidth' value to your post frontmatter for book covers."
    );
  } catch (error) {
    console.error("An error occurred during image processing:", error);
  }
}

processImages();
