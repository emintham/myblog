import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';
import { generateSlug } from '../../utils/slugify';
import type { PostApiPayload } from '../../types/admin';
import { transformApiPayloadToFrontmatter, generatePostFileContent } from '../../utils/adminApiHelpers';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (import.meta.env.PROD) {
    return new Response(JSON.stringify({ message: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const payload: PostApiPayload = await request.json();

    if (!payload.title || !payload.pubDate || !payload.postType) {
      return new Response(JSON.stringify({ message: 'Missing required fields (title, pubDate, postType)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const slug = generateSlug(payload.title || 'untitled');
    const filename = `${slug}.mdx`; // Default to mdx for new posts
    const projectRoot = process.cwd();
    const filePath = path.join(projectRoot, 'src', 'content', 'blog', filename);

    try {
      await fs.access(filePath);
      return new Response(JSON.stringify({ message: `File already exists: ${filename}. Please use a different title.` }), {
        status: 409, // Conflict
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // File does not exist, proceed with creation
    }

    const frontmatterObject = transformApiPayloadToFrontmatter(payload);
    const fileContent = generatePostFileContent(frontmatterObject, payload.bodyContent || '', payload.postType, true);

    await fs.writeFile(filePath, fileContent);

    return new Response(JSON.stringify({
      message: 'Post created successfully!',
      filename: filename,
      path: `/blog/${slug}`,
      newSlug: slug,
      title: frontmatterObject.title // Return the processed title
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    if (error instanceof SyntaxError && error.message.toLowerCase().includes("json")) {
      console.error('[API Create] Error parsing JSON body:', error);
      return new Response(JSON.stringify({ message: 'Invalid JSON data received.', errorDetail: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    console.error('[API Create] Error creating post:', error);
    return new Response(JSON.stringify({ message: 'Error creating post.', errorDetail: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
