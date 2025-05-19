// scripts/clear-posts.mjs
const fs = require("fs").promises; // Use promises API for async/await
const path = require("path");
const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const postsDir = path.join(__dirname, "..", "src", "content", "blog");
const bookQuotesDir = path.join(
  __dirname,
  "..",
  "src",
  "content",
  "bookQuotes"
);

async function clearContent() {
  let filesToDelete = [];
  let markdownFiles = [];
  let quoteFiles = [];

  try {
    // Check and list Markdown files in postsDir
    try {
      const blogDirFiles = await fs.readdir(postsDir);
      markdownFiles = blogDirFiles.filter(
        (file) => file.endsWith(".md") || file.endsWith(".mdx")
      );
      if (markdownFiles.length > 0) {
        filesToDelete.push(
          ...markdownFiles.map((file) => ({
            dir: postsDir,
            name: file,
            type: "Post",
          }))
        );
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Error reading posts directory (${postsDir}):`, error);
        // We might still want to proceed if only one directory has an issue other than not existing.
      } else {
        console.log(
          `Posts directory (${postsDir}) not found. No posts to delete from there.`
        );
      }
    }

    // Check and list YAML files in bookQuotesDir
    try {
      const quoteDirFiles = await fs.readdir(bookQuotesDir);
      quoteFiles = quoteDirFiles.filter(
        (file) => file.endsWith(".yaml") || file.endsWith(".yml") // Assuming YAML, add .json if needed
      );
      if (quoteFiles.length > 0) {
        filesToDelete.push(
          ...quoteFiles.map((file) => ({
            dir: bookQuotesDir,
            name: file,
            type: "Book Quote File",
          }))
        );
      }
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(
          `Error reading book quotes directory (${bookQuotesDir}):`,
          error
        );
      } else {
        console.log(
          `Book quotes directory (${bookQuotesDir}) not found. No quotes to delete from there.`
        );
      }
    }

    if (filesToDelete.length === 0) {
      console.log(
        "No content found in src/content/blog/ or src/content/bookQuotes/ to delete."
      );
      readline.close();
      return;
    }

    console.log("Found the following content to delete:");
    filesToDelete.forEach((file) =>
      console.log(
        `- ${file.name} (${file.type} from ${path.basename(file.dir)})`
      )
    );

    readline.question(
      "Are you sure you want to delete all this content? (yes/no): ",
      async (answer) => {
        if (answer.toLowerCase() === "yes" || answer.toLowerCase() === "y") {
          for (const file of filesToDelete) {
            try {
              await fs.unlink(path.join(file.dir, file.name));
              console.log(`Deleted ${file.name} (${file.type})`);
            } catch (deleteError) {
              console.error(`Error deleting ${file.name}:`, deleteError);
            }
          }
          console.log("\nAll specified content cleared.");
        } else {
          console.log("\nOperation cancelled. No content was deleted.");
        }
        readline.close();
      }
    );
  } catch (error) {
    // This catch block is for unexpected errors not related to directory reading itself.
    // ENOENT for directories is handled above.
    console.error("An unexpected error occurred:", error);
    readline.close();
  }
}

clearContent();
