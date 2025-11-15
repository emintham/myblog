// src/hooks/usePostSubmission.ts
import { useState, useCallback } from "react";
import type {
  PostFormData,
  PostSourceData,
  PostApiPayload,
} from "../types/admin";
import type { ApiSuccessResponse, ApiErrorResponse } from "../types/api";

interface UsePostSubmissionProps {
  // existingPostData is used to determine if it's an update and to pass original identifiers
  existingPostData?: PostSourceData;
  // resetForm is a callback to reset the form, typically from react-hook-form
  resetForm: (values?: PostFormData) => void;
  // defaultValues are used to reset the form on successful creation
  defaultFormValues: PostFormData;
}

type ActionType = "create" | "update";

// Define an augmented type for the event result
type PostSuccessEventResult = PostSourceData & {
  message?: string;
  path?: string;
  newSlug?: string;
};

export function usePostSubmission({
  existingPostData,
  resetForm,
  defaultFormValues,
}: UsePostSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitPost = useCallback(
    async (formData: PostFormData, isAutoSave = false) => {
      setIsSubmitting(true);
      window.dispatchEvent(
        new CustomEvent("postFormSubmitting", {
          detail: { isSubmitting: true, isAutoSave },
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
      delete (payload as Partial<PostApiPayload>).bookCoverImageName;
      delete (payload as Partial<PostApiPayload>).bookCoverAlt;

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
      }

      // Clean and validate payload before serialization
      let requestBody: string;
      try {
        // Use a replacer to handle potential circular references and non-serializable values
        requestBody = JSON.stringify(payload, (key, value) => {
          // Handle null/undefined
          if (value === null || value === undefined) {
            return value;
          }
          // Filter out functions
          if (typeof value === "function") {
            if (import.meta.env.DEV) {
              console.warn(
                `[usePostSubmission:${actionType.toUpperCase()}] Removing function at key: ${key}`
              );
            }
            return undefined;
          }
          // Filter out DOM nodes
          if (typeof value === "object" && value instanceof Node) {
            if (import.meta.env.DEV) {
              console.warn(
                `[usePostSubmission:${actionType.toUpperCase()}] Removing DOM node at key: ${key}`
              );
            }
            return undefined;
          }
          return value;
        });

        if (import.meta.env.DEV) {
          const payloadSizeKB = new Blob([requestBody]).size / 1024;
          console.log(
            `[usePostSubmission:${actionType.toUpperCase()}] Payload size: ${payloadSizeKB.toFixed(2)} KB`
          );
          if (payloadSizeKB > 1024) {
            console.warn(
              `[usePostSubmission:${actionType.toUpperCase()}] Large payload detected (> 1MB)`
            );
          }
        }
      } catch (serializeError) {
        const errorMessage =
          serializeError instanceof Error
            ? serializeError.message
            : "Unknown serialization error";
        if (import.meta.env.DEV) {
          console.error(
            `[usePostSubmission:${actionType.toUpperCase()}] Failed to serialize payload:`,
            serializeError
          );
          console.error(
            `[usePostSubmission:${actionType.toUpperCase()}] Problematic payload keys:`,
            Object.keys(payload)
          );
        }
        throw new Error(`Failed to serialize form data: ${errorMessage}`);
      }

      try {
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        });

        const apiResult: ApiSuccessResponse | ApiErrorResponse =
          await response.json();

        if (import.meta.env.DEV) {
          console.log(
            `[usePostSubmission:${actionType.toUpperCase()}] API Response Status: ${response.status}`
          );
          console.log(
            `[usePostSubmission:${actionType.toUpperCase()}] Parsed API Response:`,
            apiResult
          );
        }

        if (response.ok) {
          const successResult = apiResult as ApiSuccessResponse;
          const finalFormState: PostFormData = {
            ...formData,
            title: successResult.title,
            originalSlug: successResult.newSlug,
            originalFilePath: successResult.newFilePath,
            originalExtension: successResult.newExtension,
            quotesRef:
              successResult.quotesRef !== undefined
                ? successResult.quotesRef
                : formData.quotesRef,
          };

          // Skip form reset during auto-save to preserve cursor position
          if (!isAutoSave) {
            resetForm(
              actionType === "create" ? defaultFormValues : finalFormState
            );
          }

          const eventDataForResult: PostSuccessEventResult = {
            ...finalFormState,
            bookCover: {
              imageName: finalFormState.bookCoverImageName,
              alt: finalFormState.bookCoverAlt,
            },
            // Add relevant fields from API response for consumers like FeedbackDisplay
            message: successResult.message,
            path: successResult.path,
            // Ensure newSlug is also directly available if needed, though originalSlug holds it post-creation/update
            newSlug: successResult.newSlug,
          };
          delete (eventDataForResult as Partial<PostSuccessEventResult>)
            .bookCoverImageName;
          delete (eventDataForResult as Partial<PostSuccessEventResult>)
            .bookCoverAlt;

          window.dispatchEvent(
            new CustomEvent("postFormSuccess", {
              detail: { result: eventDataForResult, actionType, isAutoSave },
            })
          );
        } else {
          const errorResult = apiResult as ApiErrorResponse;
          if (import.meta.env.DEV) {
            console.error(
              `[usePostSubmission:${actionType.toUpperCase()}] API Error:`,
              errorResult.message || response.statusText,
              errorResult
            );
          }
          window.dispatchEvent(
            new CustomEvent("postFormError", {
              detail: { error: errorResult, actionType, isAutoSave },
            })
          );
        }
      } catch (error: unknown) {
        const errorPayload: ApiErrorResponse = {
          message:
            error instanceof Error
              ? error.message
              : "An unknown error occurred",
          stack: error instanceof Error ? error.stack : undefined,
        };

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
          new CustomEvent("postFormError", {
            detail: { error: errorPayload, actionType, isAutoSave },
          })
        );
      } finally {
        setIsSubmitting(false);
        window.dispatchEvent(
          new CustomEvent("postFormSubmitting", {
            detail: { isSubmitting: false, isAutoSave },
          })
        );
      }
    },
    [existingPostData, resetForm, defaultFormValues] // defaultFormValues is no longer directly used for reset on create success
  );

  return { submitPost, isSubmitting };
}
