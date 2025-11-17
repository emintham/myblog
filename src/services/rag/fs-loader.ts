/**
 * File system-based content loader for CLI tools
 *
 * Loads content directly from markdown/YAML files without Astro runtime
 */

import * as fs from "fs/promises";
import * as path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

const BLOG_DIR = "./src/content/blog";
const BOOK_QUOTES_DIR = "./src/content/bookQuotes";

export interface PostFrontmatter {
  title: string;
  postType: "standard" | "fleeting" | "bookNote";
  tags?: string[];
  series?: string;
  pubDate?: Date;
  bookTitle?: string;
  bookAuthor?: string;
  quotesRef?: string;
  draft?: boolean;
}

export interface Post {
  slug: string;
  data: PostFrontmatter;
  body: string;
}

export interface BookQuotes {
  quotesRef: string;
  bookTitle: string;
  bookAuthor: string;
  quotes: Array<{
    text: string;
    tags?: string[];
    quoteAuthor?: string;
    quoteSource?: string;
  }>;
}

/**
 * Load all posts from the blog directory
 */
export async function loadAllPosts(): Promise<Post[]> {
  try {
    const files = await fs.readdir(BLOG_DIR);
    const markdownFiles = files.filter(
      (f) => f.endsWith(".md") || f.endsWith(".mdx")
    );

    const posts: Post[] = [];

    for (const file of markdownFiles) {
      const filePath = path.join(BLOG_DIR, file);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      // Extract slug from filename
      const slug = file.replace(/\.(md|mdx)$/, "");

      posts.push({
        slug,
        data: data as PostFrontmatter,
        body: content,
      });
    }

    return posts;
  } catch (error) {
    console.error("[FS Loader] Failed to load posts:", error);
    return [];
  }
}

/**
 * Load book quotes from a YAML file
 */
export async function loadBookQuotes(
  quotesRef: string
): Promise<BookQuotes | null> {
  try {
    const filePath = path.join(BOOK_QUOTES_DIR, `${quotesRef}.yaml`);
    const fileContent = await fs.readFile(filePath, "utf-8");
    const data = yaml.load(fileContent) as Record<string, unknown>;

    if (!data || !data.bookTitle || !data.bookAuthor) {
      console.warn(`[FS Loader] Invalid book quotes file: ${quotesRef}`);
      return null;
    }

    return {
      quotesRef,
      bookTitle: data.bookTitle,
      bookAuthor: data.bookAuthor,
      quotes: data.quotes || [],
    };
  } catch (error) {
    console.warn(`[FS Loader] Failed to load book quotes ${quotesRef}:`, error);
    return null;
  }
}

/**
 * Load all book quotes from the directory
 */
export async function loadAllBookQuotes(): Promise<BookQuotes[]> {
  try {
    const files = await fs.readdir(BOOK_QUOTES_DIR);
    const yamlFiles = files.filter(
      (f) => f.endsWith(".yaml") || f.endsWith(".yml")
    );

    const allQuotes: BookQuotes[] = [];

    for (const file of yamlFiles) {
      const quotesRef = file.replace(/\.(yaml|yml)$/, "");
      const quotes = await loadBookQuotes(quotesRef);
      if (quotes) {
        allQuotes.push(quotes);
      }
    }

    return allQuotes;
  } catch (error) {
    console.error("[FS Loader] Failed to load book quotes directory:", error);
    return [];
  }
}
