import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define target directories in src/content
const targetPostsDir = path.join(__dirname, "..", "src", "content", "blog");
const targetBookQuotesDir = path.join(
  __dirname,
  "..",
  "src",
  "content",
  "bookQuotes"
);

// Define source directories in .exported-content
const importBaseDir = path.join(__dirname, "..", ".exported-content");
const importPostsDir = path.join(importBaseDir, "blog");
const importBookQuotesDir = path.join(importBaseDir, "bookQuotes");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function importContent() {
  try {
    let proceedWithImport = true;

    // --- Check Blog Posts for Import ---
    const postsToImportExists =
      (await fs.pathExists(importPostsDir)) &&
      (await fs.readdir(importPostsDir)).length > 0;
    if (!postsToImportExists) {
      console.log(
        `No posts found in the export directory (${importPostsDir}) to import.`
      );
    }

    // --- Check Book Quotes for Import ---
    const bookQuotesToImportExists =
      (await fs.pathExists(importBookQuotesDir)) &&
      (await fs.readdir(importBookQuotesDir)).length > 0;
    if (!bookQuotesToImportExists) {
      console.log(
        `No book quotes found in the export directory (${importBookQuotesDir}) to import.`
      );
    }

    if (!postsToImportExists && !bookQuotesToImportExists) {
      console.log("No content found in the export directories to import.");
      return;
    }

    // --- Warning if target directories already contain content ---
    const currentPosts = (await fs.pathExists(targetPostsDir))
      ? await fs.readdir(targetPostsDir)
      : [];
    const currentBookQuotes = (await fs.pathExists(targetBookQuotesDir))
      ? await fs.readdir(targetBookQuotesDir)
      : [];

    let warningMessage = "";
    if (
      currentPosts.filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
        .length > 0
    ) {
      warningMessage += `The directory ${targetPostsDir} already contains posts.\n`;
    }
    if (
      currentBookQuotes.filter(
        (f) => f.endsWith(".yaml") || f.endsWith(".json")
      ).length > 0
    ) {
      warningMessage += `The directory ${targetBookQuotesDir} already contains book quotes.\n`;
    }

    if (warningMessage) {
      warningMessage += `Importing will overwrite any files with the same name.
It's recommended to run 'pnpm run clear-posts' (and potentially clear bookQuotes manually or update clear-posts script) first if you want a clean import.
Continue with import? (yes/no): `;
      const answer = await question(warningMessage);
      if (answer.toLowerCase() !== "yes" && answer.toLowerCase() !== "y") {
        console.log("Import operation cancelled.");
        proceedWithImport = false;
      }
    }

    if (!proceedWithImport) {
      return;
    }

    // --- Import Blog Posts ---
    if (postsToImportExists) {
      await fs.ensureDir(targetPostsDir);
      await fs.copy(importPostsDir, targetPostsDir, { overwrite: true });
      console.log(
        `Successfully imported posts from ${importPostsDir} to ${targetPostsDir}`
      );
    }

    // --- Import Book Quotes ---
    if (bookQuotesToImportExists) {
      await fs.ensureDir(targetBookQuotesDir);
      await fs.copy(importBookQuotesDir, targetBookQuotesDir, {
        overwrite: true,
      });
      console.log(
        `Successfully imported book quotes from ${importBookQuotesDir} to ${targetBookQuotesDir}`
      );
    }

    console.log("\nImport process completed.");
  } catch (error) {
    console.error("Error importing content:", error);
  } finally {
    rl.close();
  }
}

importContent();
