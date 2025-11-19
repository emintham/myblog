#!/usr/bin/env node

/**
 * RAG Query Tool
 *
 * Query the RAG index for related content
 *
 * Environment variables are loaded via `tsx --import dotenv/config`
 */

import { getEmbeddingProvider } from "../src/services/rag/embeddings.ts";
import { createStorage } from "../src/services/rag/storage.ts";
import * as fs from "fs/promises";
import * as path from "path";

/**
 * Load existing index metadata without initializing storage
 */
async function loadExistingMetadata() {
  try {
    const RAG_DATA_DIR = process.env.RAG_DATA_DIR || "./data/rag";
    const metadataPath = path.join(RAG_DATA_DIR, "metadata.json");
    const data = await fs.readFile(metadataPath, "utf-8");
    const metadata = JSON.parse(data);
    return {
      embeddingModel: metadata.embeddingModel,
      embeddingDim: metadata.embeddingDim,
    };
  } catch {
    // No existing metadata
    return null;
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
let queryText = "";
let topK = 5;
let contentType = "all";

// Parse flags
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--top-k" && args[i + 1]) {
    topK = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === "--type" && args[i + 1]) {
    contentType = args[i + 1];
    i++;
  } else if (!args[i].startsWith("--")) {
    queryText = args[i];
  }
}

if (!queryText) {
  console.log(
    'Usage: pnpm rq "search text" [--top-k N] [--type posts|quotes|all]'
  );
  console.log("\nOptions:");
  console.log("  --top-k N    Number of results to return (default: 5)");
  console.log("  --type TYPE  Content type to search (posts, quotes, or all)");
  console.log("\nExample:");
  console.log('  pnpm rq "semantic search" --top-k 10 --type posts');
  process.exit(1);
}

console.log(`🔍 Searching for: "${queryText}"\n`);

try {
  const startTime = Date.now();

  // Load existing index metadata to guide provider selection
  const existingMetadata = await loadExistingMetadata();

  // Initialize provider and storage
  const provider = await getEmbeddingProvider(existingMetadata);
  const storage = await createStorage(provider.dimensions, provider.name);

  // Generate query embedding
  const queryVector = await provider.embedSingle(queryText);

  let results = [];

  // Search based on content type
  if (contentType === "posts" || contentType === "all") {
    const postResults = await storage.searchPosts(queryVector, topK);
    results.push(...postResults);
  }

  if (contentType === "quotes" || contentType === "all") {
    const quoteResults = await storage.searchQuotes(queryVector, topK);
    results.push(...quoteResults);
  }

  // Sort by score and limit to topK
  results.sort((a, b) => b.score - a.score);
  results = results.slice(0, topK);

  const queryTime = Date.now() - startTime;

  if (results.length === 0) {
    console.log("No results found.\n");
    process.exit(0);
  }

  // Display results
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const metadata = result.metadata;
    const score = (result.score * 100).toFixed(1);

    console.log(`\n${"=".repeat(80)}`);
    console.log(`Result #${i + 1} - Similarity: ${score}%`);
    console.log("=".repeat(80));

    if ("slug" in metadata && metadata.slug) {
      // Post result
      console.log(`\n📝 Type: Blog Post`);
      console.log(`Title: ${metadata.title || "Untitled"}`);
      const url = `/blog/${metadata.slug}${metadata.paragraphIndex !== undefined ? `#para-${metadata.paragraphIndex}` : ""}`;
      console.log(`URL: ${url}`);
      if (metadata.tags && metadata.tags.length > 0) {
        console.log(`Tags: ${metadata.tags.join(", ")}`);
      }
      if (metadata.series) {
        console.log(`Series: ${metadata.series}`);
      }
      if (metadata.postType) {
        console.log(`Post Type: ${metadata.postType}`);
      }
      console.log(`\nContent Preview:\n${"-".repeat(80)}`);
      console.log(result.content);
      console.log("-".repeat(80));
    } else if ("quotesRef" in metadata && metadata.quotesRef) {
      // Quote result
      console.log(`\n💬 Type: Book Quote`);
      console.log(`Book: ${metadata.bookTitle || "Unknown"}`);
      console.log(`Author: ${metadata.bookAuthor || "Unknown"}`);
      if (metadata.tags && metadata.tags.length > 0) {
        console.log(`Tags: ${metadata.tags.join(", ")}`);
      }
      console.log(`\nQuote:\n${"-".repeat(80)}`);
      console.log(result.content);
      console.log("-".repeat(80));
    } else {
      // Fallback for results with missing/corrupted metadata
      console.log(`\n⚠️  Type: Unknown (metadata corrupted or missing)`);
      console.log(`\nContent:\n${"-".repeat(80)}`);
      console.log(result.content);
      console.log("-".repeat(80));
      if (Object.keys(metadata).length > 0) {
        console.log(`\nRaw metadata: ${JSON.stringify(metadata, null, 2)}`);
      }
    }
  }

  console.log(`Found ${results.length} results in ${queryTime}ms\n`);

  process.exit(0);
} catch (error) {
  console.error("\n❌ Error querying index:", error.message);
  console.error("\nStack trace:", error.stack);
  process.exit(1);
}
