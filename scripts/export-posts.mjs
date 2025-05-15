import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, "..", "src", "content", "blog");
const exportDir = path.join(__dirname, "..", ".exported-content", "blog");

async function exportPosts() {
  try {
    // Ensure export directory exists and is empty
    await fs.emptyDir(exportDir);
    console.log(`Cleaned export directory: ${exportDir}`);

    // Check if posts directory exists
    if (
      !(await fs.pathExists(postsDir)) ||
      (await fs.readdir(postsDir)).length === 0
    ) {
      console.log("No posts found in src/content/blog/ to export.");
      return;
    }

    await fs.copy(postsDir, exportDir);
    console.log(`Successfully exported posts from ${postsDir} to ${exportDir}`);
  } catch (error) {
    console.error("Error exporting posts:", error);
  }
}

exportPosts();
