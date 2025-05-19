import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define source directories
const postsDir = path.join(__dirname, "..", "src", "content", "blog");
const bookQuotesDir = path.join(
  __dirname,
  "..",
  "src",
  "content",
  "bookQuotes"
);

// Define export (target) directories
const exportBaseDir = path.join(__dirname, "..", ".exported-content");
const exportPostsDir = path.join(exportBaseDir, "blog");
const exportBookQuotesDir = path.join(exportBaseDir, "bookQuotes");

async function exportContent() {
  try {
    // Ensure base export directory exists
    await fs.ensureDir(exportBaseDir);
    console.log(`Ensured base export directory exists: ${exportBaseDir}`);

    // --- Export Blog Posts ---
    await fs.emptyDir(exportPostsDir);
    console.log(`Cleaned export directory for posts: ${exportPostsDir}`);

    if (
      !(await fs.pathExists(postsDir)) ||
      (await fs.readdir(postsDir)).length === 0
    ) {
      console.log("No posts found in src/content/blog/ to export.");
    } else {
      await fs.copy(postsDir, exportPostsDir);
      console.log(
        `Successfully exported posts from ${postsDir} to ${exportPostsDir}`
      );
    }

    // --- Export Book Quotes ---
    await fs.emptyDir(exportBookQuotesDir);
    console.log(
      `Cleaned export directory for book quotes: ${exportBookQuotesDir}`
    );

    if (
      !(await fs.pathExists(bookQuotesDir)) ||
      (await fs.readdir(bookQuotesDir)).length === 0
    ) {
      console.log("No book quotes found in src/content/bookQuotes/ to export.");
    } else {
      await fs.copy(bookQuotesDir, exportBookQuotesDir);
      console.log(
        `Successfully exported book quotes from ${bookQuotesDir} to ${exportBookQuotesDir}`
      );
    }

    console.log("\nExport process completed.");
  } catch (error) {
    console.error("Error exporting content:", error);
  }
}

exportContent();
