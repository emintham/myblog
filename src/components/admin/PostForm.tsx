import React, { useEffect, useState, useCallback } from "react";
import { useForm, type UseFormReturn, Controller } from "react-hook-form"; // Import Controller
import type { PostSourceData, PostFormData, Quote } from "../../types/admin"; // Added Quote
import { usePostSubmission } from "../../hooks/usePostSubmission";
import InlineQuotesManager from "./InlineQuotesManager"; // Import the new component
import TagsComponent from "./TagsComponent"; // Import TagsComponent

export interface PostFormProps {
  postData?: PostSourceData; // Data from source, optional for create mode. Now includes optional inlineQuotes.
  formId: string; // ID of the parent <form> element
  allPostTags?: string[]; // Optional: All unique post tags for suggestions
  allBookTags?: string[]; // Optional: All unique book tags for suggestions
  allQuoteTags?: string[]; // Optional: All unique quote tags for suggestions
}

const POST_TYPES = ["standard", "fleeting", "bookNote"];
const TODAY_ISO = new Date().toISOString().split("T")[0];

const formatDateForInput = (date?: string | Date): string => {
  if (!date) return TODAY_ISO;
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch (e) {
    return TODAY_ISO;
  }
};

// formatTagsForInput function is no longer needed and will be removed.

const defaultValues: PostFormData = {
  title: "",
  pubDate: TODAY_ISO,
  description: "",
  postType: "standard",
  tags: [], // Changed from '' to []
  series: "",
  draft: true,
  bodyContent: "",
  bookTitle: "",
  bookAuthor: "",
  bookCoverImageName: "",
  bookCoverAlt: "",
  quotesRef: "",
  bookTags: [], // Changed from '' to []
  inlineQuotes: [], // Added for inline quotes
  originalSlug: undefined,
  originalFilePath: undefined,
  originalExtension: undefined,
};

const PostForm: React.FC<PostFormProps> = ({
  postData,
  formId,
  allPostTags, // Destructure new props
  allBookTags,
  allQuoteTags,
}) => {
  const {
    register, // register might not be needed for controlled fields like TagsComponent
    handleSubmit,
    watch,
    reset,
    getValues, // Add getValues
    setValue, // Add setValue
    control, // Add control for Controller
    formState: { errors },
  }: UseFormReturn<PostFormData> = useForm<PostFormData>({
    defaultValues, // Default values now have tags and bookTags as []
    mode: "onSubmit", // Validate on submit
    reValidateMode: "onChange", // Re-validate on change after first submission attempt
  });

  // Use the new hook
  const { submitPost, isSubmitting: isSubmittingHook } = usePostSubmission({
    existingPostData: postData,
    resetForm: reset,
    defaultFormValues: defaultValues,
  });

  // Expose isSubmitting state from the hook if needed by parent or other parts of this component
  // For now, PostForm itself doesn't directly use isSubmittingLocal for UI changes,
  // as that's handled by the event listeners in Astro pages.
  // If PostForm needed to change its own UI based on submission state, use isSubmittingHook.

  const watchedPostType = watch("postType", defaultValues.postType);
  const watchedBookTitle = watch("bookTitle"); // Watch bookTitle for dynamic alt text
  const [showBookNoteFieldsUI, setShowBookNoteFieldsUI] = useState(
    watchedPostType === "bookNote"
  );
  const [inlineQuotes, setInlineQuotes] = useState<Quote[]>([]); // Initialize empty, will be set by useEffect
  const [isQuotesRefReadOnly, setIsQuotesRefReadOnly] = useState(false); // State for quotesRef read-only status

  useEffect(() => {
    setShowBookNoteFieldsUI(watchedPostType === "bookNote");
  }, [watchedPostType]);

  useEffect(() => {
    if (postData && postData.originalSlug) {
      // If postData includes inlineQuotes (from Astro page loading them), use those.
      // Otherwise, use the default (empty array).
      const initialQuotes =
        postData.inlineQuotes || defaultValues.inlineQuotes || [];

      // Helper to process tags from PostSourceData to string[]
      const processSourceTags = (tags?: string | string[]): string[] => {
        if (Array.isArray(tags))
          return tags.map((tag) => String(tag).trim()).filter(Boolean);
        if (typeof tags === "string")
          return tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        return [];
      };

      const transformedData: PostFormData = {
        title: postData.title || "",
        pubDate: formatDateForInput(postData.pubDate),
        description: postData.description || "",
        postType: postData.postType || "standard",
        tags: processSourceTags(postData.tags), // Use new processing logic
        series: postData.series || "",
        draft: postData.hasOwnProperty("draft") ? !!postData.draft : false,
        bodyContent: postData.bodyContent || "",
        bookTitle: postData.bookTitle || "",
        bookAuthor: postData.bookAuthor || "",
        bookCoverImageName: postData.bookCover?.imageName || "",
        bookCoverAlt: postData.bookCover?.alt || "",
        quotesRef: postData.quotesRef || "",
        bookTags: processSourceTags(postData.bookTags), // Use new processing logic
        inlineQuotes: initialQuotes, // Use loaded or default quotes
        originalSlug: postData.originalSlug,
        originalFilePath: postData.originalFilePath,
        originalExtension: postData.originalExtension,
      };
      reset(transformedData);
      setInlineQuotes(initialQuotes);

      // If quotesRef has a value (meaning it's an existing book note with a ref,
      // potentially with loaded quotes), make the input read-only.
      if (postData.quotesRef && postData.postType === "bookNote") {
        setIsQuotesRefReadOnly(true);
      } else {
        setIsQuotesRefReadOnly(false);
      }
    } else {
      reset(defaultValues);
      setInlineQuotes(defaultValues.inlineQuotes || []);
      setIsQuotesRefReadOnly(false);
    }
  }, [postData, reset]);

  // Handlers for InlineQuotesManager
  const handleAddQuote = useCallback(() => {
    setInlineQuotes((prevQuotes) => [
      ...prevQuotes,
      {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15), // Simple unique ID
        text: "",
        tags: [],
      },
    ]);
  }, []);

  const handleRemoveQuote = useCallback((id: string) => {
    setInlineQuotes((prevQuotes) =>
      prevQuotes.filter((quote) => quote.id !== id)
    );
  }, []);

  const handleUpdateQuoteField = useCallback(
    <K extends keyof Omit<Quote, "id">>(
      id: string,
      field: K,
      value: Quote[K]
    ) => {
      setInlineQuotes((prevQuotes) =>
        prevQuotes.map((quote) =>
          quote.id === id ? { ...quote, [field]: value } : quote
        )
      );
    },
    []
  );

  // Effect to automatically set bookCoverAlt based on bookTitle
  useEffect(() => {
    if (watchedBookTitle) {
      setValue("bookCoverAlt", `Cover for ${watchedBookTitle}`, {
        shouldValidate: false,
        shouldDirty: false,
      });
    } else {
      // Clear alt text if book title is removed
      setValue("bookCoverAlt", "", {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [watchedBookTitle, setValue]);

  // The submitPost function from the hook is stable due to useCallback.
  // It's used within the custom submit handler attached to the parent form.

  useEffect(() => {
    const parentForm = document.getElementById(formId);
    if (parentForm && parentForm instanceof HTMLFormElement) {
      const formSubmitWrapper = async (event: SubmitEvent) => {
        event.preventDefault();
        // Manually trigger RHF validation and then call submitPost with all form data, including inlineQuotes.
        const isValid = await handleSubmit((formData) =>
          submitPost({ ...formData, inlineQuotes })
        )();
        // handleSubmit(callback)() calls the callback if validation passes.
      };

      parentForm.addEventListener("submit", formSubmitWrapper);
      return () => {
        parentForm.removeEventListener("submit", formSubmitWrapper);
      };
    }
  }, [formId, handleSubmit, submitPost, getValues, inlineQuotes]); // Added inlineQuotes to dependencies

  return (
    <>
      {/* Fieldset for Core Information */}
      <fieldset>
        <legend>Core Information</legend>
        <div className="form-field">
          <label htmlFor="title">Title*</label>
          <input
            type="text"
            id="title"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <span className="field-error-message">{errors.title.message}</span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="pubDate">Publication Date*</label>
          <input
            type="date"
            id="pubDate"
            {...register("pubDate", {
              required: "Publication date is required",
              valueAsDate: true, // Ensures RHF treats it as a date for potential date-specific validation
            })}
          />
          {errors.pubDate && (
            <span className="field-error-message">
              {errors.pubDate.message}
            </span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" {...register("description")}></textarea>
        </div>
        <div className="form-field">
          <label htmlFor="postType">Post Type</label>
          <select id="postType" {...register("postType")}>
            {POST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      {/* Fieldset for Metadata */}
      <fieldset>
        <legend>Metadata</legend>
        <div className="form-field">
          {/* <label htmlFor="tags">Tags</label>
          <input type="text" id="tags" {...register('tags')} placeholder="e.g., tech, philosophy, life" /> */}
          <Controller
            name="tags"
            control={control}
            defaultValue={[]} // Ensure default is an array
            render={({ field }) => (
              <TagsComponent
                id="tags"
                label="Tags"
                value={field.value || []} // Ensure value is always an array
                onChange={field.onChange}
                onBlur={field.onBlur} // Pass onBlur for RHF
                suggestions={allPostTags} // Prop passed from Astro page
                placeholder="e.g., tech, philosophy, life"
              />
            )}
          />
          {errors.tags && (
            <span className="field-error-message">
              {(errors.tags as any).message || "Invalid tags"}
            </span>
          )}
        </div>
        <div className="form-field">
          <label htmlFor="series">Series</label>
          <input
            type="text"
            id="series"
            {...register("series")}
            placeholder="e.g., My Learning Journey"
          />
        </div>
        <div className="form-field">
          <label>
            <input type="checkbox" id="draft" {...register("draft")} />
            Mark as Draft
          </label>
        </div>
      </fieldset>

      {/* Fieldset for Book Note Details (conditionally rendered) */}
      {showBookNoteFieldsUI && (
        <fieldset id="formBookNoteFieldsReact" className="book-note-fields">
          <legend>Book Note Details</legend>
          <div className="form-field">
            <label htmlFor="bookTitle">Book Title</label>
            <input type="text" id="bookTitle" {...register("bookTitle")} />
          </div>
          <div className="form-field">
            <label htmlFor="bookAuthor">Book Author</label>
            <input type="text" id="bookAuthor" {...register("bookAuthor")} />
          </div>
          <div className="form-field">
            <label htmlFor="bookCoverImageName">Book Cover Image Name</label>
            <input
              type="text"
              id="bookCoverImageName"
              {...register("bookCoverImageName")}
              placeholder="e.g., meditations-cover"
            />
          </div>
          {/* Book Cover Alt Text field is removed and will be auto-generated */}
          {/* quotesRef input is now removed from UI as per Deliverable 4 */}
          {/* The value will be managed internally or by the API */}
          <div className="form-field">
            {/* <label htmlFor="bookTags">Book Tags</label>
            <input type="text" id="bookTags" {...register('bookTags')} placeholder="e.g., stoicism, philosophy" /> */}
            <Controller
              name="bookTags"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <TagsComponent
                  id="bookTags"
                  label="Book Tags"
                  value={field.value || []}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  suggestions={allBookTags} // Prop passed from Astro page
                  placeholder="e.g., stoicism, philosophy"
                />
              )}
            />
            {errors.bookTags && (
              <span className="field-error-message">
                {(errors.bookTags as any).message || "Invalid book tags"}
              </span>
            )}
          </div>
          <InlineQuotesManager
            quotes={inlineQuotes}
            onAddQuote={handleAddQuote}
            onRemoveQuote={handleRemoveQuote}
            onUpdateQuoteField={handleUpdateQuoteField}
            allQuoteTags={allQuoteTags} // Pass down to InlineQuotesManager
          />
        </fieldset>
      )}

      {/* Fieldset for Body Content */}
      <fieldset>
        <legend>Content</legend>
        <div className="form-field">
          <label htmlFor="bodyContent">Post Body (Markdown)</label>
          <textarea
            id="bodyContent"
            {...register("bodyContent")}
            rows={15}
            placeholder="Start writing your Markdown content here..."
          ></textarea>
        </div>
      </fieldset>
    </>
  );
};
export default PostForm;
