// src/pages/api/update-post-handler.ts
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { dump } from 'js-yaml';
import { generateSlug } from '../../utils/slugify';
import { AUTHOR_NAME } from '../../siteConfig';

export const prerender = false;

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
      originalSlug,
      originalFilePath,
      originalExtension,
      title,
      pubDate,
      postType,
      description,
      tags, // string or array
      series,
      draft, // boolean
      bodyContent,
      bookTitle,
      bookAuthor,
      bookCover, // object { imageName, alt } or potentially flat properties
      bookCoverImageName, // flat property from form
      bookCoverAlt,       // flat property from form
      quotesRef,
      bookTags, // string or array
    } = data;

    if (!originalFilePath || !title || !pubDate || !postType) {
      return new Response(JSON.stringify({ message: 'Missing required fields (originalFilePath, title, pubDate, postType)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentTitle = title || 'untitled';
    const newSlug = generateSlug(currentTitle);
    const fileExtension = originalExtension || path.extname(originalFilePath) || '.md';
    const newFilename = `${newSlug}${fileExtension}`;

    const projectRoot = process.cwd();
    const contentBlogDir = path.join(projectRoot, 'src', 'content', 'blog');
    const newFilePath = path.join(contentBlogDir, newFilename);

    const frontmatterObject: Record<string, any> = {
      title: currentTitle,
      pubDate: pubDate, // Ensure YYYY-MM-DD
      author: AUTHOR_NAME,
      postType: postType,
      draft: draft === true || draft === 'on' || draft === 'true', // Ensure boolean
    };

    if (description) frontmatterObject.description = description;
    if (series) frontmatterObject.series = series;

    if (tags) {
      const tagsArray = (typeof tags === 'string' ? tags.split(',') : Array.isArray(tags) ? tags : [])
        .map((tag: string) => tag.trim()).filter((tag: string) => tag);
      if (tagsArray.length > 0) frontmatterObject.tags = tagsArray;
    }

    if (postType === 'bookNote') {
      if (bookTitle) frontmatterObject.bookTitle = bookTitle;
      if (bookAuthor) frontmatterObject.bookAuthor = bookAuthor;
      
      // Consolidate bookCover information
      let finalBookCover: { imageName?: string; alt?: string } = {};
      if (bookCover && typeof bookCover === 'object' && (bookCover.imageName || bookCover.alt)) {
        finalBookCover = { imageName: bookCover.imageName || '', alt: bookCover.alt || ''};
      } else if (bookCoverImageName || bookCoverAlt) { // From flat form fields
        finalBookCover = { imageName: bookCoverImageName || '', alt: bookCoverAlt || ''};
      }
      if (finalBookCover.imageName || finalBookCover.alt) { // Only add if there's something to add
          frontmatterObject.bookCover = finalBookCover;
      }

      if (quotesRef) frontmatterObject.quotesRef = quotesRef;
      if (bookTags) {
        const bookTagsArray = (typeof bookTags === 'string' ? bookTags.split(',') : Array.isArray(bookTags) ? bookTags : [])
          .map((tag: string) => tag.trim()).filter((tag: string) => tag);
        if (bookTagsArray.length > 0) frontmatterObject.bookTags = bookTagsArray;
      }
    }
    
    // Remove any undefined fields
    for (const key in frontmatterObject) {
      if (frontmatterObject[key] === undefined) {
        delete frontmatterObject[key];
      }
    }

    const frontmatterString = dump(frontmatterObject, { skipInvalid: true });
    const fileContent = `---\n${frontmatterString}---\n\n${(bodyContent || '').trim()}`;

    if (newFilePath !== originalFilePath) {
      try {
        await fs.access(newFilePath);
        return new Response(JSON.stringify({ 
          message: `Cannot update post. A different file already exists with the new title/slug: ${newFilename}. Please choose a different title.` 
        }), {
          status: 409, // Conflict
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        // File does not exist at newFilePath, safe to proceed with rename/move.
      }
    }

    await fs.writeFile(newFilePath, fileContent);

    if (newFilePath !== originalFilePath && originalFilePath) {
      try {
        await fs.access(originalFilePath); // Check before unlinking
        await fs.unlink(originalFilePath);
      } catch (err: any) {
        console.warn(`Could not delete old file at ${originalFilePath} or it didn't exist: ${err.message}`);
      }
    }

    return new Response(JSON.stringify({
      message: 'Post updated successfully!',
      filename: newFilename,
      path: `/blog/${newSlug}`,
      newSlug: newSlug,
      newFilePath: newFilePath,
      newExtension: fileExtension
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error updating post:', error);
    if (error instanceof SyntaxError && error.message.toLowerCase().includes("json")) {
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
