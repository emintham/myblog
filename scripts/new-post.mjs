const fs = require("fs").promises;
const path = require("path");
const readline = require("readline");

// Simple slugify function (ensure this is suitable or use your more robust one)
function generateSlug(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "") // Removed negation to keep only word chars and hyphens
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

const postsDir = path.join(__dirname, "..", "src", "content", "blog");
const templatePath = path.join(__dirname, "post-template.md"); // Path to your template

async function createNewPost() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

  try {
    const title = await question("Enter post title: ");
    if (!title.trim()) {
      console.log("Title cannot be empty. Aborting.");
      rl.close();
      return;
    }

    const description = await question(
      "Enter a short description (optional): "
    );
    const tagsInput = await question(
      "Enter tags (comma-separated, optional): "
    );
    const seriesInput = await question(
      "Enter series name (optional, leave blank if none): "
    );
    // Default author, consider making this configurable perhaps via an environment variable or a simple config file later
    const author = "Your Name";

    const slug = generateSlug(title);
    const fileName = `${slug}.md`; // or .mdx if you plan for that
    const filePath = path.join(postsDir, fileName);
    const pubDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Prepare replacement values
    const titleValue = title.replace(/"/g, '\\"'); // Escape double quotes for YAML
    const descriptionValue = description.replace(/"/g, '\\"');
    const authorValue = author.replace(/"/g, '\\"');

    const tagsLine = tagsInput.trim()
      ? `tags: [${tagsInput
          .split(",")
          .map((tag) => `"${tag.trim().replace(/"/g, '\\"')}"`)
          .join(", ")}]`
      : "# tags: []"; // Comment out if empty, or use `tags: []` for an empty list

    const seriesLine = seriesInput.trim()
      ? `series: "${seriesInput.trim().replace(/"/g, '\\"')}"`
      : '# series: ""'; // Comment out if empty, or use `series: ""`

    // Read the template file
    let templateContent;
    try {
      templateContent = await fs.readFile(templatePath, "utf-8");
    } catch (readError) {
      console.error(
        `Error reading template file at ${templatePath}:`,
        readError
      );
      console.error("Please ensure 'scripts/post-template.md' exists.");
      rl.close();
      return;
    }

    // Replace placeholders
    templateContent = templateContent
      .replace("{{TITLE}}", titleValue)
      .replace("{{PUB_DATE}}", pubDate)
      .replace("{{DESCRIPTION}}", descriptionValue)
      .replace("{{AUTHOR}}", authorValue)
      .replace("{{TAGS_LINE_PLACEHOLDER}}", tagsLine)
      .replace("{{SERIES_LINE_PLACEHOLDER}}", seriesLine);

    // Check if file already exists
    try {
      await fs.access(filePath);
      const overwrite = await question(
        `File "${fileName}" already exists. Overwrite? (yes/no): `
      );
      if (
        overwrite.toLowerCase() !== "yes" &&
        overwrite.toLowerCase() !== "y"
      ) {
        console.log("Operation cancelled. File not overwritten.");
        rl.close();
        return;
      }
    } catch (e) {
      // File does not exist, proceed
    }

    await fs.writeFile(filePath, templateContent);
    console.log(`\nNew post created: src/content/blog/${fileName}`);
    console.log(
      "Remember to change 'draft: true' to 'draft: false' when ready to publish!"
    );
  } catch (error) {
    console.error("\nError creating new post:", error);
  } finally {
    rl.close();
  }
}

// Ensure posts directory exists, then run
fs.mkdir(postsDir, { recursive: true })
  .then(createNewPost)
  .catch((err) => {
    console.error("Could not create posts directory:", err);
    // Close readline interface if it was opened and an error occurs early
    if (typeof rl !== "undefined" && rl) {
      rl.close();
    }
  });
