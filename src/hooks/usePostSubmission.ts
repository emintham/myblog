// src/hooks/usePostSubmission.ts
import { useState, useCallback } from 'react';
import type { PostFormData, PostSourceData, PostApiPayload } from '../types/admin';

interface UsePostSubmissionProps {
  // existingPostData is used to determine if it's an update and to pass original identifiers
  existingPostData?: PostSourceData;
  // resetForm is a callback to reset the form, typically from react-hook-form
  resetForm: (values?: PostFormData) => void;
  // defaultValues are used to reset the form on successful creation
  defaultFormValues: PostFormData;
}

type ActionType = 'create' | 'update';

export function usePostSubmission({ existingPostData, resetForm, defaultFormValues }: UsePostSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPost = useCallback(async (formData: PostFormData) => {
    setIsSubmitting(true);
    window.dispatchEvent(new CustomEvent('postFormSubmitting', { detail: { isSubmitting: true } }));

    let apiEndpoint = '';
    let actionType: ActionType = 'create';
    
    // Start with formData and cast to PostApiPayload for manipulation
    const payload: PostApiPayload = { ...formData };

    // Transform bookCover from flat to nested if present
    if (formData.bookCoverImageName || formData.bookCoverAlt) {
      payload.bookCover = {
        imageName: formData.bookCoverImageName,
        alt: formData.bookCoverAlt,
      };
    }
    // Remove the flat properties as they are not part of PostApiPayload in this form
    delete (payload as any).bookCoverImageName;
    delete (payload as any).bookCoverAlt;

    if (existingPostData?.originalSlug) {
      actionType = 'update';
      apiEndpoint = '/api/update-post-handler';
      payload.originalSlug = existingPostData.originalSlug;
      payload.originalFilePath = existingPostData.originalFilePath;
      payload.originalExtension = existingPostData.originalExtension;
    } else {
      actionType = 'create';
      apiEndpoint = '/api/create-post-handler';
      // Ensure these are not present for create
      delete payload.originalSlug;
      delete payload.originalFilePath;
      delete payload.originalExtension;
    }

    if (import.meta.env.DEV) {
      console.log(`[usePostSubmission:${actionType.toUpperCase()}] Submitting to: ${apiEndpoint}`);
      console.log(`[usePostSubmission:${actionType.toUpperCase()}] Payload:`, JSON.stringify(payload, null, 2));
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (import.meta.env.DEV) {
        console.log(`[usePostSubmission:${actionType.toUpperCase()}] API Response Status: ${response.status}`);
        console.log(`[usePostSubmission:${actionType.toUpperCase()}] Parsed API Response:`, result);
      }

      if (response.ok) {
        window.dispatchEvent(new CustomEvent('postFormSuccess', { detail: { result, actionType } }));
        if (actionType === 'create') {
          resetForm(defaultFormValues); // Reset form with default values on successful creation
        }
      } else {
        if (import.meta.env.DEV) {
          console.error(`[usePostSubmission:${actionType.toUpperCase()}] API Error:`, result.message || response.statusText, result);
        }
        window.dispatchEvent(new CustomEvent('postFormError', { detail: { error: result, actionType } }));
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error(`[usePostSubmission:${actionType.toUpperCase()}] Fetch/JSON Parse Error:`, error);
        if (error instanceof Error) {
          console.error(`[usePostSubmission:${actionType.toUpperCase()}] Error name: ${error.name}, message: ${error.message}`);
        }
      }
      window.dispatchEvent(new CustomEvent('postFormError', { detail: { error, actionType } }));
    } finally {
      setIsSubmitting(false);
      window.dispatchEvent(new CustomEvent('postFormSubmitting', { detail: { isSubmitting: false } }));
    }
  }, [existingPostData, resetForm, defaultFormValues]);

  return { submitPost, isSubmitting };
}