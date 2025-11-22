/**
 * Navigation utilities for admin interface
 */

/**
 * Open post in editor in new tab
 * @param slug - Post slug
 */
export function openInEditor(slug: string): void {
  window.open(`/admin/edit/${slug}`, "_blank");
}
