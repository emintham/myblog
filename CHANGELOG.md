# Changelog

## Oct 26, 2025

- Fixed auto-save page refresh and cursor reset by ignoring content directory from Vite HMR.
- Reduced auto-save interval to 10 seconds.
- Added toast notifications for save feedback.
- Added Zod validation schemas for API handlers.
- Replaced textarea with CodeMirror 6 editor for markdown editing with syntax highlighting and collapsible headings.

## Oct 19, 2025

- Added TOC component.

## May 16, 2025

- Added support for marking articles as part of a series for better discovery.
- Added support for marking article tags for better discovery.
- Added styling for blockquotes.
- Fixed new-post script.
- Mark all example posts as drafts so that they are not accidentally published in prod but show up in dev.
- Make sidenote link style more apparent.
- Extract site-wide variables into a separate file for easier management.

## May 17

- Add Remark42 commenting system.
- Style changes.

## May 18

- Added support for shorter posts "fleeting".

## May 19

- Added support for book notes, quotes.

## May 21

- Script to process images for CLS.
- Using `srcset` for images, custom component.

## May 22

- Filter out draft posts in the index for PROD.

## May 23

- Generate alt text for book cover.

## May 25

- Jules cleaned up CSS and some components.
- Big update: Added support for dev mode authoring.

## May 31

- Big update: separate modes for author/reader
- Refactors.
- Tests.
- V1 of close reading function.
