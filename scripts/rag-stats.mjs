#!/usr/bin/env node

/**
 * RAG Statistics Tool
 *
 * Display statistics about the RAG index
 */

import { getEmbeddingProvider } from "../src/services/rag/embeddings.ts";
import { createStorage } from "../src/services/rag/storage.ts";
import * as fs from "fs/promises";
import * as path from "path";

const RAG_DATA_DIR = process.env.RAG_DATA_DIR || "./data/rag";

console.log("📊 RAG Index Statistics\n");

try {
  // Initialize provider and storage
  const provider = await getEmbeddingProvider();
  const storage = await createStorage(provider.dimensions, provider.name);

  const metadata = await storage.getMetadata();

  if (!metadata) {
    console.log("⚠️  No index found. Run `pnpm rrb` to create one.\n");
    process.exit(0);
  }

  // Display statistics
  console.log("Embedding Configuration:");
  console.log(`  Model: ${metadata.embeddingModel}`);
  console.log(`  Provider: ${provider.name}`);
  console.log(`  Dimensions: ${metadata.embeddingDim}`);
  console.log(`  Version: ${metadata.version}\n`);

  console.log("Content Statistics:");
  console.log(`  Posts: ${metadata.stats.totalPosts}`);
  console.log(`  Paragraphs: ${metadata.stats.totalParagraphs}`);
  console.log(`  Quotes: ${metadata.stats.totalQuotes}\n`);

  if (metadata.lastUpdated) {
    const lastUpdated = new Date(metadata.lastUpdated);
    console.log(`Last Updated: ${lastUpdated.toLocaleString()}\n`);
  }

  // Calculate storage size
  try {
    const postsTablePath = path.join(RAG_DATA_DIR, "posts.lance");
    const quotesTablePath = path.join(RAG_DATA_DIR, "quotes.lance");

    let postsSize = 0;
    let quotesSize = 0;

    try {
      const postsStat = await fs.stat(postsTablePath);
      if (postsStat.isDirectory()) {
        // LanceDB stores data in a directory structure
        const files = await fs.readdir(postsTablePath, { recursive: true });
        for (const file of files) {
          const filePath = path.join(postsTablePath, file);
          try {
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
              postsSize += stat.size;
            }
          } catch {
            // Skip files we can't read
          }
        }
      }
    } catch {
      // Posts table doesn't exist yet
    }

    try {
      const quotesStat = await fs.stat(quotesTablePath);
      if (quotesStat.isDirectory()) {
        const files = await fs.readdir(quotesTablePath, { recursive: true });
        for (const file of files) {
          const filePath = path.join(quotesTablePath, file);
          try {
            const stat = await fs.stat(filePath);
            if (stat.isFile()) {
              quotesSize += stat.size;
            }
          } catch {
            // Skip files we can't read
          }
        }
      }
    } catch {
      // Quotes table doesn't exist yet
    }

    if (postsSize > 0 || quotesSize > 0) {
      console.log("Storage:");
      console.log(`  Posts table: ${formatBytes(postsSize)}`);
      console.log(`  Quotes table: ${formatBytes(quotesSize)}`);
      console.log(`  Total: ${formatBytes(postsSize + quotesSize)}\n`);
    }
  } catch {
    // Storage info not available
  }

  process.exit(0);
} catch (error) {
  console.error("\n❌ Error retrieving statistics:", error.message);
  console.error("\nStack trace:", error.stack);
  process.exit(1);
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
