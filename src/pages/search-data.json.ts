// src/pages/search-data.json.ts
import { getCollection } from "astro:content";
import { prepareSearchData } from "../utils/searchUtils";

export async function GET() {
  const allPosts = await getCollection("blog", ({ data }) => {
    // In production, exclude drafts from search
    return import.meta.env.PROD ? data.draft !== true : true;
  });

  const searchData = prepareSearchData(allPosts);

  return new Response(JSON.stringify(searchData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Prerender this endpoint at build time
export const prerender = true;
