/**
 * Custom Vite plugin for debounced content HMR
 *
 * This plugin debounces content file changes to prevent auto-save from triggering
 * rapid reloads, while still allowing you to see updates without restarting the server.
 */
export function contentHmr({ debounceMs = 3000 } = {}) {
  let debounceTimer = null;
  let pendingReload = false;

  return {
    name: 'vite-plugin-content-hmr',

    handleHotUpdate({ file, server }) {
      // Only intercept content file changes
      if (!file.includes('/src/content/')) {
        return; // Let Vite handle other files normally
      }

      console.log(`[content-hmr] Content changed: ${file.split('/').pop()}`);

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      pendingReload = true;

      // Debounce the reload to prevent auto-save spam
      debounceTimer = setTimeout(() => {
        if (pendingReload) {
          console.log('[content-hmr] Refreshing content collections...');

          // Invalidate content-related modules
          server.moduleGraph.invalidateAll();

          // Trigger a full reload (necessary for content collections)
          server.ws.send({
            type: 'full-reload',
            path: '*'
          });

          pendingReload = false;
        }
      }, debounceMs);

      // Return empty array to prevent immediate reload
      return [];
    }
  };
}
