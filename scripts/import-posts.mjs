import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, "..", "src", "content", "blog");
const importDir = path.join(__dirname, "..", ".exported-content", "blog");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function importPosts() {
  try {
    if (
      !(await fs.pathExists(importDir)) ||
      (await fs.readdir(importDir)).length === 0
    ) {
      console.log(
        `No posts found in the export directory (${importDir}) to import.`
      );
      return;
    }

    const currentPosts = (await fs.pathExists(postsDir))
      ? await fs.readdir(postsDir)
      : [];
    if (
      currentPosts.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
        .length > 0
    ) {
      const answer = await question(
        `The directory ${postsDir} already contains posts.
 Importing will overwrite any files with the same name.
It's recommended to run 'pnpm run clear-posts' first if you want a clean import.
Continue with import? (yes/no): `
      );
      if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
        console.log("Import operation cancelled.");
        return;
      }
    }

    // Ensure target directory exists
    await fs.ensureDir(postsDir);

    await fs.copy(importDir, postsDir, { overwrite: true });
    console.log(`Successfully imported posts from ${importDir} to ${postsDir}`);
  } catch (error) {
    console.error("Error importing posts:", error);
  } finally {
    rl.close();
  }
}

importPosts();
