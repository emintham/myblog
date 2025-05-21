# Kinfolk Inspired Astro Blog Template

A minimalist, text-focused blog template built with [Astro](https://astro.build/),
inspired by the clean aesthetic of Kinfolk magazine. Designed for writers and developers
who appreciate typography and a serene reading experience. Provides features
that enhance knowledge curation and management, ideal for a personal blog or
Second Brain.

[Live Demo](https://emintham.com)
[Changelog](https://github.com/emintham/blog-template/blob/master/CHANGELOG.md)

## Core Features

- **Minimalist & Elegant Design:** Clean, spacious, and typography-centric, inspired by Kinfolk.
- **Astro Powered:** Leverages Astro for a fast, modern, and content-focused experience.
- **Responsive Layout:** Adapts gracefully to all screen sizes, ensuring a great reading experience on any device.
- **SEO Friendly:** Includes structural SEO enhancements and automatic sitemap generation.
- **Optimized Images:** Includes a script to convert and resize images to WebP format with JPG fallbacks, using the `<picture>` element for responsive delivery.
- **Homepage:** Lists recent posts with previews for easy discovery.
  ![Main Page Screenshot](images/IMG_0028.PNG)

## Advanced Content & Knowledge Management

This template goes beyond a simple blog, offering features tailored for organizing and curating knowledge:

- **Multiple Post Types:**

  - **Standard Posts:** For traditional, long-form blog articles.
  - **Fleeting Thoughts:** Compact posts for brief insights or notes, displayed fully in previews without a "Read More" link. Ideal for quick, atomic ideas.
    ![Short Post Screenshot](images/IMG_0041.jpeg)
  - **Book Notes:** A dedicated format for in-depth book reviews, summaries, and curated quotes. This feature helps in building a personal knowledge base from your reading.
    - **Detailed Display:** Rich presentation for individual book notes, including responsive book cover, author details, your review, and a collapsible quotes section.
      ![Book Notes Screenshot in Details Page](images/IMG_0042.PNG)
    - **Organized Quotes:** Quotes are managed in separate YAML files for clarity and ease of editing, complete with their own tags for granular categorization.
      ![Book Quotes Screenshot](images/IMG_0043.PNG)
    - **Dedicated Tagging Systems:**
      - **Book Tags:** Categorize books by genre, theme, etc. (e.g., "non-fiction", "philosophy").
        ![Book Tags Screenshot](images/IMG_0044.PNG)
        ![Book Tags Screen](images/IMG_0051.PNG)
      - **Quote Tags:** Tag individual quotes for easy retrieval and cross-referencing (e.g., "leadership", "mindfulness").
        ![Book Quotes Tag Screen](images/IMG_0053.PNG)
    - **Preview Cards:** Distinct preview style for book notes in listings.
      ![Book Notes Screenshot](images/IMG_0046.PNG)

- **Taxonomies & Organization:**

  - **General Tags Page:** Automatically generated page listing all general post tags with post counts (`/tags/`).
    ![Tags Page Screenshot](images/IMG_0029.PNG)
  - **Series Page:** Group related posts into series, each with its own dedicated page and chronological listing (`/series/`).
    ![Series Page Screenshot](images/IMG_0030.PNG)

- **Sidenotes / Marginalia:**

  - Tufte-style sidenotes that appear in the margin on wider screens, gracefully falling back to standard footnotes on smaller screens.
  - Supports numbered `[^1]` or named `[^my-note]` footnotes for better organization and easier reference, especially in longer texts.
    ![Sidenotes Screenshot](images/IMG_0032.jpeg)
    _Example Markdown for Sidenotes:_

    ```markdown
    This is some text using a numbered footnote.[^1] This text uses a named footnote.[^my-memorable-note]

    [^1]: This is the first sidenote, using a number.

    [^my-memorable-note]: This is the second one, referenced by a name. This can be helpful for managing many footnotes.
    ```

## Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended, check Astro's current requirements)
- [pnpm](https://pnpm.io/installation) (This template uses `pnpm` for package management)
- `sharp` and `glob` dependencies (install with `pnpm add sharp glob fs-extra` if not already present from `pnpm install`).

## Getting Started

1.  **Use This Template:**

    - Click the green "**Use this template**" button on the [GitHub repository page](https://github.com/emintham/blog-template).
    - Or, clone the repository: `git clone https://github.com/emintham/blog-template.git your-blog-name`
    - Navigate into your new project directory: `cd your-blog-name`

2.  **Install Dependencies:**

    ```bash
    pnpm install
    ```

    _(This should install `sharp`, `glob`, and `fs-extra` if they are listed in `package.json`.)_

3.  **Initial Configuration (Important TODOs):**

    - **Site URL:** Open `astro.config.mjs` and set the `site` property to your blog's final URL (e.g., `site: 'https://your-domain.com',`). This is crucial for SEO and sitemap generation.
    - **Site Name & Author Details:** Modify `src/siteConfig.ts` to match your details.
    - **About Page:** Customize the content in `src/pages/about.astro`.
    - **Favicon & Public Assets:** Replace `public/favicon.svg` with your own. Update other assets in `public/` as needed.
    - **Image Source Directory:** Create an `images/originals/` directory in your project root. This is where you will place your original high-resolution images before processing.

4.  **Clear Example Content (Optional):**
    The template may include example posts and quote files. To remove them:
    ```bash
    pnpm run clear-posts
    ```
    _(This script clears both `src/content/blog/` and `src/content/bookQuotes/`.)_

## Development Workflow

1.  **Start the Dev Server:**

    ```bash
    pnpm run dev
    ```

    Access your site at `http://localhost:4321`. For access from other devices on your network:

    ```bash
    pnpm run dev --host
    ```

2.  **Image Processing:**

    - Place your original high-resolution images (JPG, PNG) in the `images/originals/` directory at the root of your project.
    - Run the image processing script to generate optimized WebP versions and responsive sizes:
      ```bash
      pnpm run img
      ```
    - Processed images will be saved to `public/images/processed/`. You only need to run this script when you add or change images in `images/originals/`.

3.  **Content Creation:**
    Use the interactive script to scaffold new content:

    ```bash
    pnpm run new-post
    ```

    The script will guide you through creating:

    - **Standard Posts:** Traditional blog articles.
    - **Fleeting Thoughts:** Short, compact notes.
    - **Book Notes:** Detailed book reviews with associated quote files.

    **Detailed instructions for each type:**

    **a. Standard Posts:**

    - The script prompts for a description, tags, and series (all optional).
    - A Markdown file is created in `src/content/blog/` with `postType: "standard"`.

    **b. Fleeting Thoughts:**

    - The script prompts for a short description/thought (main content) and optional tags.
    - A Markdown file is created in `src/content/blog/` with `postType: "fleeting"`.

    **c. Book Notes:**

    - The script prompts for:
      - Review description, book title, and author.
      - Optional: **Base image name** for the book cover (e.g., `my-book-cover` if your original image is `images/originals/my-book-cover.jpg`) and alt text. The script and components will expect processed versions in `public/images/processed/`.
      - Optional: Book-specific tags (genre, theme).
      - Optional: General post tags and series for the review itself.
    - A Markdown file for your review is created in `src/content/blog/` with `postType: "bookNote"` and relevant frontmatter (including `bookCover.imageName` and `quotesRef`).
    - **Quotes File:** A YAML file with stub quotes is automatically created in `src/content/bookQuotes/`. The filename matches the `quotesRef` (e.g., `your-post-slug-quotes.yaml`).
      - **Manually edit this YAML file** to add your actual quotes.
      - **Example `...-quotes.yaml` structure:**
        ```yaml
        bookSlug: "your-post-slug" # Matches the slug of the .md file
        quotes:
          - text: "This is an example quote..."
            # quoteAuthor: "Book Author Name" # Optional
            # quoteSource: "Chapter 1, Page 10" # Optional
            tags: ["example-tag", "theme-inspiration"]
          - text: "Another placeholder quote..."
            # quoteAuthor: "A Character"
            tags: ["placeholder"]
        ```

    **Publishing:** All new content defaults to `draft: true`. Change to `draft: false` in the Markdown frontmatter to publish.

4.  **Linting & Formatting:**
    - Apply formatting: `pnpm run format`
    - Check for lint errors: `pnpm run lint`
    - Attempt to auto-fix lint errors: `pnpm run lint:fix`

## Deployment

This Astro blog is a static site, ready for deployment on platforms like Cloudflare Pages, Vercel, Netlify, or GitHub Pages. Connect your Git repository to your chosen platform for automatic builds and deployments. Remember to include the `public/images/processed/` directory in your deployment.

## Updating from the Original Template

If this template repository receives updates, you can merge them into your project. This requires understanding Git, especially merge conflict resolution.

**Before You Update:**

1.  Commit all your local changes: `git add . && git commit -m "My work before updating template"`
2.  (Recommended) Export your content: `pnpm run export-posts`
    (This backs up `src/content/blog/` and `src/content/bookQuotes/` to `.exported-content/`)

**Update Process:**

1.  Add Template as Upstream (One-time setup, replace URL):
    ```bash
    git remote add template_upstream git@github.com:emintham/blog-template.git
    ```
    Verify with `git remote -v`.
2.  Fetch Latest Template Changes: `git fetch template_upstream`
3.  Merge Template (ensure you're on your main branch): `git merge template_upstream/master`
4.  **Resolve Merge Conflicts:**
    - **Content Files (`src/content/...`):** Almost always keep **your version**.
    - **Template Code Files (Layouts, Components, etc.):** Manually resolve if you've modified them; otherwise, the template's version is often safe.
    - Use `git status`, edit files, `git add <resolved_file>`, then `git commit`.
    - If stuck, `git merge --abort` cancels the merge.
5.  Install/Update Dependencies: `pnpm install` (if `package.json` or lockfile changed).
6.  Test Thoroughly: `pnpm run dev`.
7.  Content Recovery (If needed): If content was affected, clean up/reset the `src/content/...` directories, then restore from backup using `pnpm run import-posts`.

## Customization

- **Colors & Fonts:** Edit CSS variables in `src/styles/global.css`.
- **Layouts & Components:** Modify Astro components in `src/layouts/` and `src/components/`. Be mindful of potential merge conflicts with future template updates.

## License

This project is licensed under the MIT License.
