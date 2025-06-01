# Kinfolk Inspired Astro Blog Template

An Astro blog template focused on minimalism and typography, inspired by Kinfolk magazine.
Ideal for writers, developers, and knowledge curators seeking a serene reading experience
and tools for a personal blog or Second Brain.

[Live Demo](https://emintham.com)
[Changelog](https://github.com/emintham/blog-template/blob/master/CHANGELOG.md)

## Core Features

- **Minimalist & Elegant Design:** Clean, spacious, and typography-centric, inspired by Kinfolk.
- **Astro Powered:** Leverages Astro for a fast, modern, and content-focused experience.
- **Responsive Layout:** Adapts gracefully to all screen sizes, ensuring a great reading experience on any device.
- **SEO Friendly:** Includes structural SEO enhancements and automatic sitemap generation.
- **Optimized Images:** Script for WebP conversion, resizing, and responsive delivery via `<picture>` element.
- **Homepage:** Displays recent posts with previews.
  ![Main Page Screenshot](images/IMG_0028.PNG)

## Advanced Content & Knowledge Management

Offers advanced features for knowledge organization and curation:

- **Multiple Post Types:**

  - **Standard Posts:** For traditional, long-form blog articles.
  - **Fleeting Thoughts:** Short-form posts for quick insights, fully displayed in previews.
    ![Short Post Screenshot](images/IMG_0041.jpeg)
  - **Book Notes:** In-depth format for book reviews, summaries, and quotes, aiding personal knowledge base construction.
    - **Detailed Display:** Rich presentation with book cover, author details, review, and collapsible quotes section.
      ![Book Notes Screenshot in Details Page](images/IMG_0042.PNG)
    - **Organized Quotes:** Quotes in separate YAML files with dedicated tags for easy management.
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

  - Tufte-style sidenotes (margin notes on wide screens, footnotes on small screens).
  - Supports numbered `[^1]` and named `[^my-note]` footnotes for clarity.
    ![Sidenotes Screenshot](images/IMG_0032.jpeg)
    _Example Markdown for Sidenotes:_

    ```markdown
    This is some text using a numbered footnote.[^1] This text uses a named footnote.[^my-memorable-note]

    [^1]: This is the first sidenote, using a number.

    [^my-memorable-note]: This is the second one, referenced by a name. This can be helpful for managing many footnotes.
    ```

- **Authoring Tools in Dev Mode:**

  - Live previews and hot reloading via Astro's dev server.
    ![Dev Mode Screenshot](images/IMG_0054.PNG)
  - Interactive dropdown menus for quick tagging.
    ![Tagging Dropdown Screenshot](images/IMG_0056.PNG)

## Documentation

- [Installation Guide](INSTALL.md)
- [Usage and Customization Guide](GUIDE.md)

## License

This project is licensed under the MIT License.
