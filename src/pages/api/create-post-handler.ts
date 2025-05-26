// src/pages/api/create-post-handler.ts
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { dump } from 'js-yaml';
import { generateSlug } from '../../utils/slugify';
import { AUTHOR_NAME } from '../../siteConfig';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ message: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const data = await request.json();

    if (!data.title || !data.pubDate || !data.postType) {
      return new Response(JSON.stringify({ message: 'Missing required fields (title, pubDate, postType)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const title = data.title;
    const slug = generateSlug(title || 'untitled');
    const filename = `${slug}.mdx`;
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, 'src', 'content', 'blog', filename);

    try {
      await fs.access(filePath);
      // File exists, return 409
      return new Response(JSON.stringify({ message: `File already exists: ${filename}` }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // File does not exist, proceed
    }

    const frontmatterObject: Record<string, any> = {
      title: title,
      pubDate: new Date(data.pubDate), // Convert string to Date object
      author: AUTHOR_NAME,
      postType: data.postType,
      draft: data.draft === true || data.draft === 'on' || data.draft === 'true', // Ensure boolean
    };

    if (data.description) {
      frontmatterObject.description = data.description;
    }
    if (data.tags) {
      const tagsArray = data.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
      if (tagsArray.length > 0) {
        frontmatterObject.tags = tagsArray;
      }
    }
    if (data.series) {
      frontmatterObject.series = data.series;
    }

    // Book Note specific fields
    if (data.postType === 'bookNote') {
      if (data.bookTitle) frontmatterObject.bookTitle = data.bookTitle;
      if (data.bookAuthor) frontmatterObject.bookAuthor = data.bookAuthor;
      
      // Handle bookCover from flat properties from FormData
      if (data.bookCoverImageName || data.bookCoverAlt) {
        frontmatterObject.bookCover = {
          imageName: data.bookCoverImageName || '',
          alt: data.bookCoverAlt || '',
        };
      } else if (data.bookCover && typeof data.bookCover === 'object') { // Handle if sent as object
        frontmatterObject.bookCover = data.bookCover;
      }

      if (data.quotesRef) frontmatterObject.quotesRef = data.quotesRef;
      if (data.bookTags) {
        const bookTagsArray = data.bookTags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
        if (bookTagsArray.length > 0) {
          frontmatterObject.bookTags = bookTagsArray;
        }
      }
    }
    
    // Remove any undefined fields that might have been set conditionally
    for (const key in frontmatterObject) {
      if (frontmatterObject[key] === undefined) {
        delete frontmatterObject[key];
      }
    }

    const frontmatterString = dump(frontmatterObject, { skipInvalid: true }); // skipInvalid to avoid issues with undefined if any slip through

    let fileContent = `---\n${frontmatterString}---\n\n`;

    const bodyInput = (data.bodyContent || '').trim();
    if (bodyInput) {
      fileContent += bodyInput;
    } else if (data.postType !== 'fleeting') {
      fileContent += '## Introduction\n\nReplace this with your first paragraph.';
    } else {
      // Fleeting posts can have an empty body
      fileContent += '';
    }

    await fs.writeFile(filePath, fileContent);

    return new Response(JSON.stringify({ 
      message: 'Post created successfully!', 
      filename: filename, 
      path: `/blog/${slug}`, // Path for viewing the post
      newSlug: slug // Slug for redirecting to edit page for example
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    // Specific check for JSON parsing errors
    if (error instanceof SyntaxError && error.message.toLowerCase().includes("json")) {
        console.error('Error parsing JSON body:', error);
        return new Response(JSON.stringify({ message: 'Invalid JSON data received.', error: error.message }), {
            status: 400, // Bad Request
            headers: { 'Content-Type': 'application/json' },
        });
    }
    console.error('Error creating post:', error);
    // Default to 500 Internal Server Error for other issues
    return new Response(JSON.stringify({ message: 'Error creating post.', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
