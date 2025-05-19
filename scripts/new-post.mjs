import fs from "fs/promises";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";
import { generateSlug } from "../src/utils/slugify.ts"; // Assuming slugify.ts is in src/utils
import { AUTHOR_NAME } from "../src/siteConfig.ts"; // Assuming siteConfig.ts is in src/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postsDir = path.join(__dirname, "..", "src", "content", "blog");
const quotesDir = path.join(__dirname, "..", "src", "content", "bookQuotes");
const postTemplatePath = path.join(__dirname, "post-template.md");
const quotesTemplatePath = path.join(__dirname, "quotes-template.yaml"); // Path to the new quotes template

// Helper to create a YAML-formatted string for an array of strings
const toYamlList = (items, indent = "  ") => {
  if (!items || items.length === 0) return "[]";
  return items
    .map((item) => `\n${indent}- "${item.replace(/"/g, '\\"')}"`)
    .join("");
};

// Helper to ask questions
const question = (rl, query) =>
  new Promise((resolve) => rl.question(query, resolve));

// --- Post Type Specific Logic ---

async function getStandardPostDetails(rl) {
  const description = await question(
    rl,
    "Enter a short description (optional): "
  );
  const tagsInput = await question(
    rl,
    "Enter tags (comma-separated, optional): "
  );
  const seriesInput = await question(
    rl,
    "Enter series name (optional, leave blank if none): "
  );
  return {
    description,
    tagsInput,
    seriesInput,
    initialContent: "Start writing your blog post here...",
    postTypeSpecificFrontmatter: {},
    populateBookNoteTemplate: null, // No specific template population for standard
  };
}

async function getFleetingThoughtDetails(rl) {
  const description = await question(
    rl,
    "Enter a short description/thought (optional, will be the main content if short): "
  );
  const tagsInput = await question(
    rl,
    "Enter tags for this fleeting thought (comma-separated, optional): "
  );
  return {
    description,
    tagsInput,
    seriesInput: "",
    initialContent: description.trim() ? "" : "A fleeting thought...",
    postTypeSpecificFrontmatter: {},
    populateBookNoteTemplate: null, // No specific template population
  };
}

async function getBookNoteDetails(rl, slug) {
  console.log("\n--- Book Note Details ---");
  const description = await question(
    rl,
    "Enter a short description for your book note/review: "
  );
  const bookTitle = await question(rl, "Enter the Book's Title: ");
  const bookAuthorInput = await question(rl, "Enter the Book's Author: ");

  const bookCoverSrc = await question(
    rl,
    "Enter Book Cover Image Path (e.g., /images/covers/book.jpg, optional): "
  );
  let bookCoverAltValue = "";
  if (bookCoverSrc.trim()) {
    bookCoverAltValue = await question(rl, "Enter Book Cover Alt Text: ");
  }

  const bookTagsInput = await question(
    rl,
    "Enter Book Tags (e.g., non-fiction, psychology - comma-separated, optional): "
  );
  const generalTagsInput = await question(
    rl,
    "Enter general tags for this book note (e.g., review, reading-list - comma-separated, optional): "
  );
  const seriesInput = await question(
    rl,
    "Enter series name for this book note (optional): "
  );

  const bookTitleValue = bookTitle.replace(/"/g, '\\"');
  const bookAuthorValue = bookAuthorInput.replace(/"/g, '\\"');
  const quotesRefValue = `${slug}-quotes`;

  let bookTagsLine = "# bookTags: []";
  if (bookTagsInput.trim()) {
    const bookTagsArray = bookTagsInput.split(",").map((tag) => tag.trim());
    bookTagsLine = `bookTags:${toYamlList(bookTagsArray, "  ")}`;
  }

  const frontmatter = {
    bookTitle: bookTitleValue,
    bookAuthor: bookAuthorValue,
    quotesRef: quotesRefValue,
  };
  if (bookCoverSrc.trim()) {
    frontmatter.bookCover = {
      src: bookCoverSrc.trim().replace(/"/g, '\\"'),
      alt: bookCoverAltValue.replace(/"/g, '\\"'),
    };
  }

  const populateBookNoteTemplate = (content) => {
    let populatedContent = content
      .replace(
        '# bookTitle: "{{BOOK_TITLE}}"',
        `bookTitle: "${frontmatter.bookTitle}"`
      )
      .replace(
        '# bookAuthor: "{{BOOK_AUTHOR}}"',
        `bookAuthor: "${frontmatter.bookAuthor}"`
      )
      .replace(
        '# quotesRef: "{{QUOTES_REF}}"',
        `quotesRef: "${frontmatter.quotesRef}"`
      )
      .replace("# bookTags: [{{BOOK_TAGS}}]", bookTagsLine);
    if (frontmatter.bookCover) {
      populatedContent = populatedContent
        .replace("# bookCover:", "bookCover:")
        .replace(
          '#   src: "{{BOOK_COVER_SRC}}"',
          `  src: "${frontmatter.bookCover.src}"`
        )
        .replace(
          '#   alt: "{{BOOK_COVER_ALT}}"',
          `  alt: "${frontmatter.bookCover.alt}"`
        );
    } else {
      populatedContent = populatedContent.replace(
        /# bookCover:\s*(\n#\s+src:.*)?(\n#\s+alt:.*)?\n/,
        ""
      );
    }
    return populatedContent;
  };

  return {
    description,
    tagsInput: generalTagsInput,
    seriesInput,
    initialContent: `Review and notes for *${bookTitleValue}* by ${bookAuthorValue}...`,
    postTypeSpecificFrontmatter: frontmatter,
    quotesRef: quotesRefValue,
    bookAuthorForQuotes: bookAuthorValue,
    populateBookNoteTemplate,
  };
}

// --- Main Script Logic ---

async function createNewPost() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const title = await question(rl, "Enter post title: ");
    if (!title.trim()) {
      console.log("Title cannot be empty. Aborting.");
      return;
    }

    const slug = generateSlug(title);
    const fileName = `${slug}.md`;
    const filePath = path.join(postsDir, fileName);
    const pubDate = new Date().toISOString().split("T")[0];
    const titleValue = title.replace(/"/g, '\\"');

    console.log("\nSelect post type:");
    console.log("1. Standard Post");
    console.log("2. Fleeting Thought");
    console.log("3. Book Note");
    const postTypeChoice = await question(rl, "Enter choice (1-3): ");

    let postDetails;
    let postType = "standard";

    switch (postTypeChoice) {
      case "1":
        postType = "standard";
        postDetails = await getStandardPostDetails(rl);
        break;
      case "2":
        postType = "fleeting";
        postDetails = await getFleetingThoughtDetails(rl);
        break;
      case "3":
        postType = "bookNote";
        postDetails = await getBookNoteDetails(rl, slug);
        break;
      default:
        console.log("Invalid choice. Defaulting to Standard Post.");
        postType = "standard";
        postDetails = await getStandardPostDetails(rl);
        break;
    }

    const descriptionValue = postDetails.description.replace(/"/g, '\\"');
    const tagsLine = postDetails.tagsInput.trim()
      ? `tags: [${postDetails.tagsInput
          .split(",")
          .map((tag) => `"${tag.trim().replace(/"/g, '\\"')}"`)
          .join(", ")}]`
      : "# tags: []";
    const seriesLine = postDetails.seriesInput.trim()
      ? `series: "${postDetails.seriesInput.trim().replace(/"/g, '\\"')}"`
      : '# series: ""';

    let postTemplateContent = await fs.readFile(postTemplatePath, "utf-8");

    postTemplateContent = postTemplateContent
      .replace("{{TITLE}}", titleValue)
      .replace("{{PUB_DATE}}", pubDate)
      .replace("{{DESCRIPTION}}", descriptionValue)
      .replace("{{AUTHOR}}", AUTHOR_NAME.replace(/"/g, '\\"'))
      .replace("{{TAGS_LINE_PLACEHOLDER}}", tagsLine)
      .replace("{{SERIES_LINE_PLACEHOLDER}}", seriesLine)
      .replace("{{POST_TYPE}}", postType)
      .replace("{{INITIAL_CONTENT}}", postDetails.initialContent);

    if (postType === "bookNote" && postDetails.populateBookNoteTemplate) {
      postTemplateContent =
        postDetails.populateBookNoteTemplate(postTemplateContent);
    } else {
      postTemplateContent = postTemplateContent.replace(
        /^# --- Book Note Specific Fields .*---$/m,
        ""
      );
      postTemplateContent = postTemplateContent.replace(
        /^# bookTitle: .*$/m,
        ""
      );
      postTemplateContent = postTemplateContent.replace(
        /^# bookAuthor: .*$/m,
        ""
      );
      postTemplateContent = postTemplateContent.replace(
        /^# bookCover:\s*(\n#\s+src:.*)?(\n#\s+alt:.*)?\n/m,
        ""
      );
      postTemplateContent = postTemplateContent.replace(
        /^# bookTags: .*$/m,
        ""
      );
      postTemplateContent = postTemplateContent.replace(
        /^# quotesRef: .*$/m,
        ""
      );
    }

    postTemplateContent = postTemplateContent
      .split("\n")
      .filter(
        (line) =>
          !line.trim().startsWith("# {{") &&
          !line.includes("{{BOOK_TITLE}}") &&
          !line.includes("{{BOOK_AUTHOR}}") &&
          !line.includes("{{BOOK_COVER_SRC}}") &&
          !line.includes("{{BOOK_COVER_ALT}}") &&
          !line.includes("{{BOOK_TAGS}}") &&
          !line.includes("{{QUOTES_REF}}")
      )
      .join("\n");
    postTemplateContent = postTemplateContent.replace(/\n\s*\n\s*\n/g, "\n\n");

    try {
      await fs.access(filePath);
      const overwrite = await question(
        rl,
        `File "${fileName}" already exists. Overwrite? (yes/no): `
      );
      if (
        overwrite.toLowerCase() !== "yes" &&
        overwrite.toLowerCase() !== "y"
      ) {
        console.log("Operation cancelled.");
        return;
      }
    } catch (e) {
      /* File does not exist, proceed */
    }

    await fs.writeFile(filePath, postTemplateContent);
    console.log(`\nNew ${postType} post created: src/content/blog/${fileName}`);

    if (postType === "bookNote" && postDetails.quotesRef) {
      const quotesFilePath = path.join(
        quotesDir,
        `${postDetails.quotesRef}.yaml`
      );
      try {
        let quotesFileContent = await fs.readFile(quotesTemplatePath, "utf-8");
        quotesFileContent = quotesFileContent
          .replace("{{BOOK_SLUG}}", slug)
          .replace(
            "{{BOOK_AUTHOR}}",
            postDetails.bookAuthorForQuotes || "Book Author"
          ); // Default if undefined

        try {
          await fs.access(quotesFilePath);
          console.warn(
            `Quotes file "${postDetails.quotesRef}.yaml" already exists. Not overwriting.`
          );
        } catch (e) {
          await fs.writeFile(quotesFilePath, quotesFileContent);
          console.log(
            `Stub quotes file created: src/content/bookQuotes/${postDetails.quotesRef}.yaml`
          );
          console.log(
            "Remember to edit this YAML file to add your actual quotes!"
          );
        }
      } catch (readError) {
        console.error(
          `Error reading quotes template file at ${quotesTemplatePath}:`,
          readError
        );
        console.log(
          "Proceeding without creating a quotes file due to template error."
        );
      }
    }

    console.log(
      "Remember to change 'draft: true' to 'draft: false' when ready to publish!"
    );
  } catch (error) {
    console.error("\nError creating new post:", error);
  } finally {
    rl.close();
  }
}

Promise.all([
  fs.mkdir(postsDir, { recursive: true }),
  fs.mkdir(quotesDir, { recursive: true }),
])
  .then(createNewPost)
  .catch((err) => {
    console.error("Could not create content directories:", err);
  });
