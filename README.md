# Blog Template

Kinfolk inspired blog template using [Astro](https://astro.build/).

# Installation

1. Install [pnpm](https://pnpm.io/installation) or any other package manager.
2. Clone this repository.
3. Run `pnpm install` to install dependencies.

# Instructions

1. Check for `TODO`s in the code and change them. [Ripgrep](https://github.com/BurntSushi/ripgrep) or regular `grep` may be helpful here.
2. Change `Your Name` and `Your Blog` in code. [Fastmod](https://github.com/facebookincubator/fastmod) may be helpful here.
3. Change "About" page at `src/pages/about.astro`.
4. Check out locally using `pnpm dev --host`. Omit host if just testing locally.
5. Delete sample posts. `pnpm clear-posts`.
6. Create new posts using `pnpm new-post`.

# To update template

This assumes that you do not have any local code changes to the template.

1. Add and commit and local changes.
2. Export your content for safety. `pnpm run export-posts`.
3. Add the upstream (one-time setup). `git remote add template_upstream git@github.com:emintham/blog-template.git`.
4. Verify the upstream. `git remote -v`.
5. Fetch the upstream. `git fetch template_upstream`.
6. Merge the upstream. `git merge template_upstream/master`.
7. Resolve any merge conflicts.
8. Re-run `pnpm install` to update dependencies.
9. Test the site locally. `pnpm dev --host`.
10. If recovery is needed, use `pnpm clear-posts` and `pnpm import-posts` to restore your content.

# Features

## Main Page
![Main](screenshots/IMG_0028.PNG)

## Tags

Tags are auto-populated and counted
![Tags](screenshots/IMG_0029.PNG)

## Series

You can create different series of articles. Each series has its own page and
is sorted in chronological order.
![Series](screenshots/IMG_0030.PNG)

## Side Notes

Tufte style side notes are supported.
![Side Notes](screenshots/IMG_0032.jpeg)

Example:
```markdown
This is the main text of your article. You might want to add a little extra detail here.[^1]
Further down, another point could benefit from a marginal note.[^2]

And a third one for good measure.[^3]

[^1]: This is the first sidenote. It provides a brief clarification.

[^2]: Here's the second sidenote, perhaps a bit longer, offering more context or a citation.

[^3]: A final thought, placed in the margin.
```

# Kinfolk Inspired Astro Blog Template

A minimalist, text-focused blog template built with [Astro](https://astro.build/),
inspired by the clean aesthetic of Kinfolk magazine. Designed for writers and developers
who appreciate typography and a serene reading experience.

`[ Live Demo ](https://emintham.com)`

## Features

* **Minimalist Design:** Clean, spacious, and typography-centric.
* **Responsive:** Adapts gracefully to all screen sizes.
* **Astro Powered:** Fast, modern, and content-focused.
* **SEO Friendly:** Structural SEO enhancements, sitemap.
* **Content Organization:**
    * **Tags Page:** Automatically generated page listing all tags with post counts (`/tags/`).
        ![Tags Page Screenshot](screenshots/IMG_0029.PNG)
    * **Series Page:** Group posts into series, each with its own page and chronological listing (`/series/`).
        ![Series Page Screenshot](screenshots/IMG_0030.PNG)
* **Sidenotes / Marginalia:** Tufte-style sidenotes that appear in the margin on wider screens, gracefully falling back to standard footnotes on smaller screens.
    ![Sidenotes Screenshot](screenshots/IMG_0032.jpeg)
    *Example Markdown for Sidenotes:*
    ```markdown
    This is some text.[^1] And some more.[^2]

    [^1]: This is the first sidenote.
    [^2]: This is the second one.
    ```
* **Homepage:** Lists recent posts with previews.
    ![Main Page Screenshot](screenshots/IMG_0028.PNG)

## Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended, check Astro's current requirements)
* [pnpm](https://pnpm.io/installation) (This template uses `pnpm` for package management)

## Getting Started

1.  **Use This Template:**
    * Click the green "**Use this template**" button on the [GitHub repository page](https://github.com/emintham/blog-template).
    * Alternatively, clone the repository: `git clone https://github.com/emintham/blog-template.git your-blog-name`
    * Navigate into your new project directory: `cd your-blog-name`

2.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

3.  **Initial Configuration (Important TODOs):**
    * **Site URL:** Open `astro.config.mjs` and set the `site` property to your blog's final URL (e.g., `site: 'https://your-domain.com',`). This is crucial for SEO and sitemap generation.
    * **Site Name & Author Details:**
        * Open `src/layouts/BaseLayout.astro`.
        * Find and replace placeholder values for `siteName` with your own details.
        * Search for other instances of `"Your Name"` or `"Your Blog Name"` throughout the project (e.g., in `src/content/config.ts` for default author) and update them. Use `rg TODO` (ripgrep) or `grep -r TODO .` to find all placeholders.
    * **About Page:** Customize the content in `src/pages/about.astro`.
    * **Favicon & Public Assets:** Replace `public/favicon.svg` with your own. Update other assets in `public/` as needed.

4.  **Clear Example Posts:**
    The template may include example posts. To remove them:
    ```bash
    pnpm run clear-posts
    ```

## Development

1.  **Start the Dev Server:**
    ```bash
    pnpm run dev
    ```
    Access your site at `http://localhost:4321`. For access from other devices on your network:
    ```bash
    pnpm run dev --host
    ```

2.  **Create New Posts:**
    Use the script to scaffold new blog posts:
    ```bash
    pnpm run new-post
    ```
    Follow the prompts. New posts are created in `src/content/blog/` and default
    to `draft: true`. Change to `draft: false` to publish.

3.  **Linting & Formatting:**
    * Apply formatting: `pnpm run format`
    * Check for lint errors: `pnpm run lint`
    * Attempt to auto-fix lint errors: `pnpm run lint:fix`

## Deployment

This Astro blog is a static site, ready for deployment on platforms like:
* Cloudflare Pages
* Vercel
* Netlify
* GitHub Pages

Connect your Git repository to your chosen platform for automatic builds and deployments on push.

## Updating from the Original Template

If this template repository receives updates, you can merge them into your project.
This requires understanding Git, especially merge conflict resolution.

**Before You Update:**
1.  **Commit all your local changes:**
    ```bash
    git add .
    git commit -m "My work before updating template"
    ```
2.  **(Recommended Safeguard) Export your content:**
    ```bash
    pnpm run export-posts
    ```
    This backs up your `src/content/blog/` directory to `.exported-content/blog/`.

**Update Process:**

1.  **Add Template as Upstream (One-time setup):**
    If you haven't already, add the original template repository as a remote. Replace `<TEMPLATE_REPO_URL>` with the actual URL (e.g., `https://github.com/emintham/blog-template.git`).
    ```bash
    git remote add template_upstream git@github.com:emintham/blog-template.git
    ```
    Verify with `git remote -v`.

2.  **Fetch Latest Template Changes:**
    ```bash
    git fetch template_upstream
    ```

3.  **Merge Template into Your Branch:**
    Ensure you are on your main working branch (e.g., `main`).
    ```bash
    git merge template_upstream/master
    ```

4.  **Resolve Merge Conflicts:**
    * **Content Files (`src/content/blog/`):** If conflicts occur here, you will almost always want to keep **your version** of your posts.
    * **Template Code Files (Layouts, Components, Styles, Configs):**
        * If you **have not** modified these files: You can often safely accept the template's version.
        * If you **have** modified these files: You'll need to manually resolve the conflicts by editing the files to incorporate both your changes and the template's updates.
    * Use `git status` to see conflicted files. Edit them, then `git add <resolved_file>`.
    * Once all conflicts are resolved and staged, complete the merge: `git commit` (Git usually prepares a merge commit message).
    * *If stuck, `git merge --abort` will cancel the merge and revert to the state before.*

5.  **Install/Update Dependencies:**
    If `package.json` or `pnpm-lock.yaml` were updated:
    ```bash
    pnpm install
    ```

6.  **Test Thoroughly:**
    ```bash
    pnpm run dev
    ```
    Check your site for any issues.

7.  **Content Recovery (If Needed after a problematic merge):**
    If your content in `src/content/blog/` was negatively affected:
    1.  Clean up/reset the `src/content/blog/` directory (e.g., using Git or manually).
    2.  You might run `pnpm run clear-posts` to ensure it's empty.
    3.  Restore your content from the backup: `pnpm run import-posts`.
    4.  Review and commit the restored content.

## Customization

* **Colors & Fonts:** Easily customize by editing the CSS variables in `src/styles/global.css`.
* **Layouts & Components:** Modify Astro components in `src/layouts/` and `src/components/`. Be mindful that changes here may conflict with future template updates if not managed carefully during merges.

## License

This project is licensed under the MIT License.
