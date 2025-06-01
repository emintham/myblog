import React, { useEffect, useCallback, useRef } from 'react';

interface FeedbackDisplayProps {
  formId: string;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ formId }) => {
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitButtonRef = useRef<HTMLButtonElement | null>(null);
  const feedbackDivRef = useRef<HTMLDivElement | null>(null);
  const feedbackMessageRef = useRef<HTMLParagraphElement | null>(null);
  const viewPostLinkRef = useRef<HTMLAnchorElement | null>(null);
  const formTypeRef = useRef<string>('create');

  useEffect(() => {
    const formElement = document.getElementById(formId) as HTMLFormElement;
    if (formElement) {
      formRef.current = formElement;
      submitButtonRef.current = formElement.querySelector('button[type="submit"]');
      formTypeRef.current = formElement.dataset.formType || 'create';
    } else {
      if (import.meta.env.DEV) {
        console.warn(`[FeedbackDisplay] Form with ID "${formId}" not found.`);
      }
    }

    feedbackDivRef.current = document.getElementById("formFeedback") as HTMLDivElement;
    feedbackMessageRef.current = document.getElementById("feedbackMessage") as HTMLParagraphElement;
    viewPostLinkRef.current = document.getElementById("viewPostLink") as HTMLAnchorElement | null;

  }, [formId]);

  const showFeedback = useCallback((message: string, type: 'success' | 'error' | 'warning') => {
    const feedbackMessageEl = feedbackMessageRef.current;
    const feedbackDivEl = feedbackDivRef.current;
    const viewPostLinkEl = viewPostLinkRef.current;

    if (feedbackMessageEl && feedbackDivEl) {
      feedbackMessageEl.textContent = message;
      feedbackDivEl.className = `form-feedback-container ${type}-message visible`;

      if (viewPostLinkEl && type !== 'success') {
        viewPostLinkEl.style.display = 'none';
      }
    }
  }, []);


  const handlePostFormSubmitting = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ isSubmitting: boolean }>;
    const { isSubmitting } = customEvent.detail;
    const button = submitButtonRef.current;
    const formType = formTypeRef.current;

    if (button) {
      button.disabled = isSubmitting;
      if (formType === "create") {
        button.textContent = isSubmitting ? "Saving..." : "Save New Post";
      } else {
        button.textContent = isSubmitting ? "Updating..." : "Update Post";
      }
    }
  }, []);

  const handlePostFormError = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ error: any; actionType: 'create' | 'update' }>;
    const { error, actionType } = customEvent.detail;
    const message = error?.message || "An unknown error occurred.";
    showFeedback(
      `Error ${actionType === "create" ? "creating" : "updating"} post: ${message}`,
      "error"
    );
    if (import.meta.env.DEV) {
      console.error(`[FeedbackDisplay] Error during ${actionType} post:`, error);
    }
  }, [showFeedback]);

  const handlePostFormSuccess = useCallback((event: Event) => {
    const customEvent = event as CustomEvent<{ result: any; actionType: 'create' | 'update' }>;
    const { result, actionType } = customEvent.detail;
    const formElement = formRef.current;
    const viewPostLinkEl = viewPostLinkRef.current;

    if (actionType === "create") {
      if (result?.newSlug && typeof result.newSlug === "string" && result.newSlug.trim() !== "") {
        showFeedback(
          (result.message || "Post created successfully!") + " Redirecting to edit page...",
          "success"
        );
        // Prevent feedback from being cleared by navigation
        setTimeout(() => {
            window.location.href = `/admin/edit/${result.newSlug}`;
        }, 100); // Short delay
      } else {
        if (import.meta.env.DEV) {
          console.warn(
            "[FeedbackDisplay] Create post success, but newSlug is missing or invalid for redirect. Result:",
            result
          );
        }
        showFeedback(
          result?.message || "Post created, but issue with redirect data.",
          "warning"
        );
      }
    } else if (actionType === "update" && formElement) {
      showFeedback(result?.message || "Post updated successfully!", "success");

      if (viewPostLinkEl && result?.path) {
        viewPostLinkEl.href = result.path;
        viewPostLinkEl.style.display = "inline-block";
      }

      const pageH1 = document.querySelector(".page-detail-header h1") as HTMLHeadingElement;
      if (pageH1 && result?.newSlug && formElement.dataset.originalSlug && result.newSlug !== formElement.dataset.originalSlug) {
        const newTitleDisplay = result.title || result.newSlug.replace(/-/g, " ").replace(/\b\w/g, (l:string) => l.toUpperCase());
        pageH1.textContent = `Edit Post: "${newTitleDisplay}"`;
        formElement.dataset.originalSlug = result.newSlug;
      }

      const originalSlugInput = formElement.querySelector('input[name="originalSlug"]') as HTMLInputElement;
      if (originalSlugInput && result?.newSlug) originalSlugInput.value = result.newSlug;

      const originalFilePathInput = formElement.querySelector('input[name="originalFilePath"]') as HTMLInputElement;
      if (originalFilePathInput && result?.newFilePath) originalFilePathInput.value = result.newFilePath;

      const originalExtensionInput = formElement.querySelector('input[name="originalExtension"]') as HTMLInputElement;
      if (originalExtensionInput && result?.newExtension) originalExtensionInput.value = result.newExtension;
    }
  }, [showFeedback]);


  useEffect(() => {
    window.addEventListener("postFormSubmitting", handlePostFormSubmitting);
    window.addEventListener("postFormError", handlePostFormError);
    window.addEventListener("postFormSuccess", handlePostFormSuccess);

    return () => {
      window.removeEventListener("postFormSubmitting", handlePostFormSubmitting);
      window.removeEventListener("postFormError", handlePostFormError);
      window.removeEventListener("postFormSuccess", handlePostFormSuccess);
    };
  }, [handlePostFormSubmitting, handlePostFormError, handlePostFormSuccess]);

  return null;
};

export default FeedbackDisplay;