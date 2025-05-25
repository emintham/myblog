// src/pages/api/create-post-handler.ts
import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
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
    console.log("[API create-post-handler] Input title:", title); // <--- ADD THIS
    console.log("[API create-post-handler] Generated slug:", slug); // <--- ADD THIS
    const filename = `${slug}.md`;
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, 'src', 'content', 'blog', filename);

    try {
      await fs.access(filePath);
      return new Response(JSON.stringify({ message: `File already exists: ${filename}` }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // File does not exist, proceed
    }

    let content = '---\n';
    content += `title: "${title.replace(/"/g, '\\"')}"\n`;
    content += `pubDate: ${data.pubDate}\n`; // Dates typically don't need quotes in YAML
    // Updated lines for author and postType:
    content += `author: "${AUTHOR_NAME.replace(/"/g, '\\"')}"\n`;
    content += `postType: "${data.postType.replace(/"/g, '\\"')}"\n`;

    if (data.description) {
      content += `description: "${data.description.replace(/\n/g, '\\n').replace(/"/g, '\\"')}"\n`;
    }
    if (data.tags) {
      const tagsArray = data.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      if (tagsArray.length > 0) {
        content += `tags:\n${tagsArray.map(tag => `  - "${tag.replace(/"/g, '\\"')}"`).join('\n')}\n`;
      }
    }
    if (data.series) {
      content += `series: "${data.series.replace(/"/g, '\\"')}"\n`;
    }
    content += `draft: ${data.draft === true || data.draft === 'on' ? true : false}\n`; // Booleans don't need quotes

    // Book Note specific fields (if any are sent and need quoting, apply same logic)
    if (data.postType === 'bookNote') {
        if (data.bookTitle) content += `bookTitle: "${data.bookTitle.replace(/"/g, '\\"')}"\n`;
        if (data.bookAuthor) content += `bookAuthor: "${data.bookAuthor.replace(/"/g, '\\"')}"\n`;
        if (data.bookCoverImageName && data.bookCoverAlt) {
            content += `bookCover:\n`;
            content += `  imageName: "${data.bookCoverImageName.replace(/"/g, '\\"')}"\n`;
            content += `  alt: "${data.bookCoverAlt.replace(/"/g, '\\"')}"\n`;
        }
        if (data.quotesRef) content += `quotesRef: "${data.quotesRef.replace(/"/g, '\\"')}"\n`;
        if (data.bookTags) {
            const bookTagsArray = data.bookTags.split(',').map(tag => tag.trim()).filter(tag => tag);
            if (bookTagsArray.length > 0) {
            content += `bookTags:\n${bookTagsArray.map(tag => `  - "${tag.replace(/"/g, '\\"')}"`).join('\n')}\n`;
            }
        }
    }

    content += '---\n\n';

    const bodyInput = (data.bodyContent || '').trim();
    if (bodyInput) {
        content += bodyInput;
    } else if (data.postType !== 'fleeting') {
        content += '## Introduction\n\nReplace this with your first paragraph.';
    } else {
        content += '';
    }

    await fs.writeFile(filePath, content);

    return new Response(JSON.stringify({ message: 'Post created successfully!', filename: filename, path: `/blog/${slug}`, newSlug: slug}), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
        console.error('Error parsing JSON body:', error);
        return new Response(JSON.stringify({ message: 'Invalid JSON data received.', error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    console.error('Error creating post:', error);
    return new Response(JSON.stringify({ message: 'Error creating post.', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
