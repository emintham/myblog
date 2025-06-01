// src/hooks/usePostSubmission.ts
import { useState, useCallback } from "react";
import type {
  PostFormData,
  PostSourceData,
  PostApiPayload,
} from "../types/admin";

interface UsePostSubmissionProps {
  // existingPostData is used to determine if it's an update and to pass original identifiers
  existingPostData?: PostSourceData;
  // resetForm is a callback to reset the form, typically from react-hook-form
  resetForm: (values?: PostFormData) => void;
  // defaultValues are used to reset the form on successful creation
  defaultFormValues: PostFormData;
}

type ActionType = "create" | "update";

export function usePostSubmission({
  existingPostData,
  resetForm,
  defaultFormValues,
}: UsePostSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPost = useCallback(
    async (formData: PostFormData) => {
      setIsSubmitting(true);
      window.dispatchEvent(
        new CustomEvent("postFormSubmitting", {
          detail: { isSubmitting: true },
        })
      );

      let apiEndpoint = "";
      let actionType: ActionType = "create";

      const payload: PostApiPayload = { ...formData };

      if (formData.bookCoverImageName || formData.bookCoverAlt) {
        payload.bookCover = {
          imageName: formData.bookCoverImageName,
          alt: formData.bookCoverAlt,
        };
      }
      delete (payload as any).bookCoverImageName;
      delete (payload as any).bookCoverAlt;

      if (existingPostData?.originalSlug) {
        actionType = "update";
        apiEndpoint = "/api/update-post-handler";
        payload.originalSlug = existingPostData.originalSlug;
        payload.originalFilePath = existingPostData.originalFilePath;
        payload.originalExtension = existingPostData.originalExtension;
      } else {
        actionType = "create";
        apiEndpoint = "/api/create-post-handler";
        delete payload.originalSlug;
        delete payload.originalFilePath;
        delete payload.originalExtension;
      }

      if (import.meta.env.DEV) {
        console.log(
          `[usePostSubmission:${actionType.toUpperCase()}] Submitting to: ${apiEndpoint}`
        );
        console.log(
          `[usePostSubmission:${actionType.toUpperCase()}] Payload:`,
          JSON.stringify(payload, null, 2)
        );
      }

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await response.json(); // API response, e.g., { title, newSlug, newFilePath, newExtension, quotesRef? }

        if (import.meta.env.DEV) {
          console.log(
            `[usePostSubmission:${actionType.toUpperCase()}] API Response Status: ${response.status}`
          );
          console.log(
            `[usePostSubmission:${actionType.toUpperCase()}] Parsed API Response:`,
            result
          );
        }

        if (response.ok) {
          // Construct the state that reflects the successfully saved form data,
          // including any server-generated/confirmed fields.
          const finalFormState: PostFormData = {
            ...formData, // Start with the data that was submitted
            title: result.title, // Use title from API response
            // Add/overwrite with identifiers from API result
            originalSlug: result.newSlug,
            originalFilePath: result.newFilePath,
            originalExtension: result.newExtension,
            quotesRef: result.quotesRef !== undefined ? result.quotesRef : formData.quotesRef,
          };

          // Reset react-hook-form's state with this complete, saved data.
          resetForm(finalFormState);

          // Prepare a PostSourceData-compatible object for the event,
          // as PostForm uses this for its currentPostDetails state.
          const eventDataForResult: PostSourceData = {
            ...finalFormState, // Spread the updated form state
            // Ensure bookCover is in the nested structure expected by PostSourceData
            bookCover: {
              imageName: finalFormState.bookCoverImageName,
              alt: finalFormState.bookCoverAlt,
              // originalWidth is not in finalFormState, this is fine for this context
            },
            // inlineQuotes are already part of finalFormState from formData
          };
          delete (eventDataForResult as any).bookCoverImageName;
          delete (eventDataForResult as any).bookCoverAlt;

          window.dispatchEvent(
            new CustomEvent("postFormSuccess", {
              detail: { result: eventDataForResult, actionType },
            })
          );
        } else {
          if (import.meta.env.DEV) {
            console.error(
              `[usePostSubmission:${actionType.toUpperCase()}] API Error:`,
              result.message || response.statusText,
              result
            );
          }
          window.dispatchEvent(
            new CustomEvent("postFormError", {
              detail: { error: result, actionType },
            })
          );
        }
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error(
            `[usePostSubmission:${actionType.toUpperCase()}] Fetch/JSON Parse Error:`,
            error
          );
          if (error instanceof Error) {
            console.error(
              `[usePostSubmission:${actionType.toUpperCase()}] Error name: ${error.name}, message: ${error.message}`
            );
          }
        }
        window.dispatchEvent(
          new CustomEvent("postFormError", { detail: { error, actionType } })
        );
      } finally {
        setIsSubmitting(false);
        window.dispatchEvent(
          new CustomEvent("postFormSubmitting", {
            detail: { isSubmitting: false },
          })
        );
      }
    },
    [existingPostData, resetForm, defaultFormValues] // defaultFormValues is no longer directly used for reset on create success
  );

  return { submitPost, isSubmitting };
}
