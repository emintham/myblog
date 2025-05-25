// src/pages/api/update-post-handler.ts
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { generateSlug } from '../../utils/slugify'; // Adjust path if necessary
import { AUTHOR_NAME } from '../../siteConfig';   // Adjust path if necessary

export const prerender = false; // This endpoint must be dynamic

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ message: 'This feature is not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();
    const {
      originalSlug,      // Slug of the post when the edit page was loaded
      originalFilePath,  // Full path of the original file being edited
      originalExtension, // e.g., '.md' or '.mdx'
      title,
      pubDate,
      postType,
      description,
      tags, // Comma-separated string from form
      series,
      draft, // Boolean
      bodyContent,
      // Book note specific fields
      bookTitle,
      bookAuthor,
      bookCover, // This should be an object like { imageName: '...', alt: '...' } from client
      quotesRef,
      bookTags, // Comma-separated string from form
    } = data;

    // --- Basic Validation ---
    if (!originalFilePath || !title || !pubDate || !postType) {
      return new Response(JSON.stringify({ message: 'Missing required fields (originalFilePath, title, pubDate, postType)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // --- Generate New Slug & Filename ---
    const currentTitle = title || 'untitled';
    const newSlug = generateSlug(currentTitle);
    const fileExtension = originalExtension || path.extname(originalFilePath) || '.md'; // Fallback to .md
    const newFilename = `${newSlug}${fileExtension}`;

    const projectRoot = process.cwd();
    const contentBlogDir = path.join(projectRoot, 'src', 'content', 'blog');
    const newFilePath = path.join(contentBlogDir, newFilename);

    // --- Construct Content ---
    let content = '---\n';
    content += `title: "${currentTitle.replace(/"/g, '\\"')}"\n`;
    content += `pubDate: ${pubDate}\n`; // Assumes YYYY-MM-DD format
    content += `author: "${AUTHOR_NAME.replace(/"/g, '\\"')}"\n`;
    content += `postType: "${postType.replace(/"/g, '\\"')}"\n`;

    if (description) content += `description: "${description.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"\n`;

    if (tags) {
      const tagsArray = (typeof tags === 'string' ? tags.split(',') : []).map(tag => tag.trim()).filter(tag => tag);
      if (tagsArray.length > 0) content += `tags:\n${tagsArray.map(tag => `  - "${tag.replace(/"/g, '\\"')}"`).join('\n')}\n`;
    }

    if (series) content += `series: "${series.replace(/"/g, '\\"')}"\n`;
    content += `draft: ${draft === true || draft === 'on' ? true : false}\n`;

    if (postType === 'bookNote') {
      if (bookTitle) content += `bookTitle: "${bookTitle.replace(/"/g, '\\"')}"\n`;
      if (bookAuthor) content += `bookAuthor: "${bookAuthor.replace(/"/g, '\\"')}"\n`;
      if (bookCover && bookCover.imageName && bookCover.alt) { // Expect bookCover as an object
          content += `bookCover:\n`;
          content += `  imageName: "${bookCover.imageName.replace(/"/g, '\\"')}"\n`;
          content += `  alt: "${bookCover.alt.replace(/"/g, '\\"')}"\n`;
          // Add originalWidth here if you plan to support it:
          // if (bookCover.originalWidth) content += `  originalWidth: ${bookCover.originalWidth}\n`;
      }
      if (quotesRef) content += `quotesRef: "${quotesRef.replace(/"/g, '\\"')}"\n`;
      if (bookTags) {
          const bookTagsArray = (typeof bookTags === 'string' ? bookTags.split(',') : []).map(tag => tag.trim()).filter(tag => tag);
          if (bookTagsArray.length > 0) content += `bookTags:\n${bookTagsArray.map(tag => `  - "${tag.replace(/"/g, '\\"')}"`).join('\n')}\n`;
      }
    }
    content += '---\n\n';
    content += (bodyContent || '').trim();

    // --- File Operations ---
    // 1. If the determined new file path is different from the original one,
    //    check if a file already exists at the new path (to prevent overwriting an *unrelated* file).
    if (newFilePath !== originalFilePath) {
      try {
        await fs.access(newFilePath);
        // If fs.access doesn't throw, it means a file exists at newFilePath.
        // This is a conflict because we are trying to rename/move to a path that's already taken by another file.
        return new Response(JSON.stringify({ message: `Cannot update post. A different file already exists with the new title/slug: ${newFilename}. Please choose a different title.` }), {
          status: 409, // Conflict
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        // File does not exist at newFilePath, so it's safe to move/rename.
      }
    }

    // 2. Write the new/updated file. This will overwrite if newFilePath is same as originalFilePath.
    await fs.writeFile(newFilePath, content);

    // 3. If the filename/path has actually changed, delete the original file.
    if (newFilePath !== originalFilePath && originalFilePath) {
      try {
        await fs.access(originalFilePath); // Check if original file still exists before unlinking
        await fs.unlink(originalFilePath);
        console.log(`Successfully deleted old file: ${originalFilePath}`);
      } catch (err) {
        // Log if deletion failed, but don't treat as a fatal error for the update itself
        // as the new file has been written. Could be due to various reasons (e.g., file was already moved/deleted).
        console.warn(`Could not delete old file at ${originalFilePath} or it didn't exist anymore:`, err.message);
      }
    }

    return new Response(JSON.stringify({
      message: 'Post updated successfully!',
      filename: newFilename,
      path: `/blog/${newSlug}`, // Path to view the post
      newSlug: newSlug,
      newFilePath: newFilePath,
      newExtension: fileExtension
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error updating post:', error);
    // Handle JSON parsing errors specifically if they occur before data destructuring
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return new Response(JSON.stringify({ message: 'Invalid JSON data received for update.', error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    return new Response(JSON.stringify({ message: 'Error updating post.', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
