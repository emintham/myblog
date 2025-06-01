This guide provides instructions on how to use, develop, and maintain your Kinfolk Inspired Astro Blog.

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
    - Processed images are saved to `public/images/processed/`. Run when new/changed originals are added.

3.  **Content Creation:**
    New content (Standard Posts, Fleeting Thoughts, Book Notes) can be created via the admin interface in development mode (e.g., `/admin/create-post`).
    This interface provides fields for all post types, including specific sections for book details and inline quote management for Book Notes.

    **Publishing:** All new content defaults to `draft: true`. Change to `draft: false` in the Markdown frontmatter (or via the admin edit interface) to publish.

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
    (Backs up content to `.exported-content/`)

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
