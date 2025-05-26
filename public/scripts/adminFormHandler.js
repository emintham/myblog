// public/scripts/adminFormHandler.js
document.addEventListener('DOMContentLoaded', () => {
  // Assuming there's only one such form per page, or use a more specific selector
  const form = document.querySelector('form.post-form');
  if (!form) {
    // if (import.meta.env.DEV) { // Removed import.meta check
      console.warn('AdminFormHandler: No form with class "post-form" found on this page.');
    // }
    return;
  }

  const formType = form.dataset.formType || 'create'; // 'create' or 'edit'
  const submitButton = form.querySelector('button[type="submit"]');
  const feedbackDiv = document.getElementById('formFeedback'); // Standard ID for feedback div
  const feedbackMessage = document.getElementById('feedbackMessage'); // Standard ID for message p tag
  const viewPostLink = document.getElementById('viewPostLink'); // Specific to edit page

  // Helper to show feedback
  function showFeedback(message, type) {
    if (feedbackMessage && feedbackDiv) {
      feedbackMessage.textContent = message;
      // Use class names from admin.css
      feedbackDiv.className = `form-feedback-container ${type}-message visible`;
      // feedbackDiv.style.display = 'block'; // Handled by 'visible' class
      if (viewPostLink && type !== 'success-message') { // Hide view link on error/warning
        viewPostLink.style.display = 'none';
      }
    }
  }

  function handlePostFormSubmitting(event) {
    const { isSubmitting } = event.detail;
    if (submitButton) {
      submitButton.disabled = isSubmitting;
      if (formType === 'create') {
        submitButton.textContent = isSubmitting ? 'Saving...' : 'Save New Post';
      } else {
        submitButton.textContent = isSubmitting ? 'Updating...' : 'Update Post';
      }
    }
  }

  function handlePostFormError(event) {
    const { error, actionType } = event.detail;
    const message = error?.message || 'An unknown error occurred.';
    showFeedback(`Error ${actionType === 'create' ? 'creating' : 'updating'} post: ${message}`, 'error');
    // if (import.meta.env.DEV) { // Removed import.meta check
      console.error(`AdminFormHandler: Error during ${actionType} post:`, error);
    // }
  }

  function handlePostFormSuccess(event) {
    const { result, actionType } = event.detail;
    
    if (actionType === 'create') {
      if (result && result.newSlug && typeof result.newSlug === 'string' && result.newSlug.trim() !== '') {
        showFeedback((result.message || 'Post created successfully!') + ' Redirecting to edit page...', 'success');
        window.location.href = `/admin/edit/${result.newSlug}`;
      } else {
        // Log if redirect condition is not met, this might indicate an API issue or unexpected data.
        console.warn('[AdminFormHandler] Create post success, but newSlug is missing or invalid for redirect. Result:', result);
        showFeedback((result?.message || 'Post created, but issue with redirect data.'), 'warning');
      }
    } else if (actionType === 'update') {
      showFeedback(result?.message || 'Post updated successfully!', 'success');
      
      if (viewPostLink && result.path) {
        viewPostLink.href = result.path; // Update link to new path if slug changed
        viewPostLink.style.display = 'inline-block';
      }

      // Update the main h1 title if the title changed, which might change the slug
      const pageH1 = document.querySelector('.page-detail-header h1');
      if (pageH1 && result.newSlug && form.dataset.originalSlug && result.newSlug !== form.dataset.originalSlug) {
         const newTitleDisplay = result.title || result.newSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
         pageH1.textContent = `Edit Post: "${newTitleDisplay}"`;
         form.dataset.originalSlug = result.newSlug; // Update for subsequent saves on same page
      }
      
      // Update hidden originalSlug, originalFilePath, originalExtension inputs if they exist and changed
      const originalSlugInput = form.querySelector('input[name="originalSlug"]');
      if (originalSlugInput && result.newSlug) originalSlugInput.value = result.newSlug;
      
      const originalFilePathInput = form.querySelector('input[name="originalFilePath"]');
      if (originalFilePathInput && result.newFilePath) originalFilePathInput.value = result.newFilePath;

      const originalExtensionInput = form.querySelector('input[name="originalExtension"]');
      if (originalExtensionInput && result.newExtension) originalExtensionInput.value = result.newExtension;

    }
  }

  // Add event listeners
  window.addEventListener('postFormSubmitting', handlePostFormSubmitting);
  window.addEventListener('postFormError', handlePostFormError);
  window.addEventListener('postFormSuccess', handlePostFormSuccess);

  // Optional: Clean up event listeners when the page unloads (though often not strictly necessary for page navigations)
  // window.addEventListener('beforeunload', () => {
  //   window.removeEventListener('postFormSubmitting', handlePostFormSubmitting);
  //   window.removeEventListener('postFormError', handlePostFormError);
  //   window.removeEventListener('postFormSuccess', handlePostFormSuccess);
  // });
});