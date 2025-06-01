import React, { useEffect, useState, useCallback, useRef } from "react"; // Added useRef
import { useForm, type UseFormReturn, Controller } from "react-hook-form";
import type { PostSourceData, PostFormData, Quote } from "../../types/admin";
import { usePostSubmission } from "../../hooks/usePostSubmission";
import InlineQuotesManager from "./InlineQuotesManager";
import TagsComponent from "./TagsComponent";

export interface PostFormProps {
  postData?: PostSourceData; // Data from source, optional for create mode. Now includes optional inlineQuotes.
  formId: string; // ID of the parent <form> element
  allPostTags?: string[]; // Optional: All unique post tags for suggestions
  allBookTags?: string[]; // Optional: All unique book tags for suggestions
  allQuoteTags?: string[]; // Optional: All unique quote tags for suggestions
}

const POST_TYPES = ["standard", "fleeting", "bookNote"];
const TODAY_ISO = new Date().toISOString().split("T")[0];
const AUTO_SAVE_INTERVAL_MS = 10000; // For auto-save interval

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
  allPostTags,
  allBookTags,
  allQuoteTags,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    setValue,
    control,
    formState: { errors },
  }: UseFormReturn<PostFormData> = useForm<PostFormData>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const bodyContentRef = useRef<HTMLTextAreaElement | null>(null); // Ref for bodyContent textarea

  // State to manage the current details of the post, especially after a new post is created.
  const [currentPostDetails, setCurrentPostDetails] = useState<PostSourceData | undefined>(postData);

  useEffect(() => {
    // Sync currentPostDetails if the postData prop changes from parent.
    setCurrentPostDetails(postData);
  }, [postData]);

  const { submitPost, isSubmitting: isSubmittingHook } = usePostSubmission({
    existingPostData: currentPostDetails, // Use state for existing data context
    resetForm: reset,
    defaultFormValues: defaultValues,
  });

  const watchedPostType = watch("postType", defaultValues.postType);
  const watchedBookTitle = watch("bookTitle");
  const [showBookNoteFieldsUI, setShowBookNoteFieldsUI] = useState(
    watchedPostType === "bookNote"
  );
  const [inlineQuotes, setInlineQuotes] = useState<Quote[]>([]);
  const [isQuotesRefReadOnly, setIsQuotesRefReadOnly] = useState(false);
  const [lastSavedBodyContent, setLastSavedBodyContent] = useState<string | undefined>(undefined);

  useEffect(() => {
    setShowBookNoteFieldsUI(watchedPostType === "bookNote");
  }, [watchedPostType]);

  useEffect(() => {
    if (postData && postData.originalSlug) {
      const initialQuotes =
        postData.inlineQuotes || defaultValues.inlineQuotes || [];
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
        tags: processSourceTags(postData.tags),
        series: postData.series || "",
        draft: postData.hasOwnProperty("draft") ? !!postData.draft : false,
        bodyContent: postData.bodyContent || "",
        bookTitle: postData.bookTitle || "",
        bookAuthor: postData.bookAuthor || "",
        bookCoverImageName: postData.bookCover?.imageName || "",
        bookCoverAlt: postData.bookCover?.alt || "",
        quotesRef: postData.quotesRef || "",
        bookTags: processSourceTags(postData.bookTags),
        inlineQuotes: initialQuotes,
        originalSlug: postData.originalSlug,
        originalFilePath: postData.originalFilePath,
        originalExtension: postData.originalExtension,
      };
      reset(transformedData);
      setInlineQuotes(initialQuotes);
      setLastSavedBodyContent(transformedData.bodyContent); 

      if (postData.quotesRef && postData.postType === "bookNote") {
        setIsQuotesRefReadOnly(true);
      } else {
        setIsQuotesRefReadOnly(false);
      }
    } else {
      reset(defaultValues);
      setInlineQuotes(defaultValues.inlineQuotes || []);
      setIsQuotesRefReadOnly(false);
      setLastSavedBodyContent(defaultValues.bodyContent); 
    }
  }, [postData, reset]);

  // Effect to update lastSavedBodyContent and currentPostDetails on successful submission
  useEffect(() => {
    const handleSuccessfulUpdate = (event: Event) => {
      // Assuming customEvent.detail.result is of type PostSourceData
      const customEvent = event as CustomEvent<{ result: PostSourceData; actionType: 'create' | 'update' }>;

      if (customEvent.detail.actionType === 'update' || customEvent.detail.actionType === 'create') {
        const currentBodyContent = getValues("bodyContent");
        setLastSavedBodyContent(currentBodyContent);

        if (customEvent.detail.actionType === 'create' && customEvent.detail.result) {
          // If a new post was created, update currentPostDetails.
          // This ensures usePostSubmission is re-initialized with the new post's context.
          setCurrentPostDetails(customEvent.detail.result);
          // usePostSubmission's resetForm should have already updated RHF's state.
        }

        if (import.meta.env.DEV) {
          console.log(`[PostForm] Post ${customEvent.detail.actionType}: lastSavedBodyContent updated.`);
        }

        // Attempt to refocus on bodyContent after any successful save
        if (bodyContentRef.current) {
          // Ensure focus happens after potential re-renders due to state updates
          setTimeout(() => bodyContentRef.current?.focus(), 0);
        }
      }
    };

    window.addEventListener('postFormSuccess', handleSuccessfulUpdate);
    return () => {
      window.removeEventListener('postFormSuccess', handleSuccessfulUpdate);
    };
  }, [getValues, setCurrentPostDetails]); // bodyContentRef is stable

  // Auto-save useEffect
  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined = undefined;

    const attemptAutoSave = async () => {
      if (isSubmittingHook) { // Don't save if already submitting from another action
        return;
      }

      const currentBodyContent = getValues("bodyContent");
      const currentTitle = getValues("title");

      // Auto-save if title exists and body content has changed since last save/load
      if (currentBodyContent !== lastSavedBodyContent && currentTitle && currentTitle.trim() !== "") {
        if (import.meta.env.DEV) {
          console.log("[PostForm] Auto-saving: Detected bodyContent change with title. Attempting save...");
        }
        const formData = getValues();
        // submitPost is derived from usePostSubmission, which uses currentPostDetails.
        // It will correctly perform a create or update.
        // The usePostSubmission hook is responsible for calling resetForm with new data on create.
        await submitPost({ ...formData, inlineQuotes });
      }
    };

    // Set up interval for auto-save, regardless of new/existing post.
    intervalId = setInterval(attemptAutoSave, AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    isSubmittingHook,
    getValues,
    lastSavedBodyContent,
    submitPost, // submitPost will be a new function if currentPostDetails changes, re-triggering effect
    inlineQuotes,
  ]);

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

  useEffect(() => {
    const parentForm = document.getElementById(formId);
    if (parentForm && parentForm instanceof HTMLFormElement) {
      const formSubmitWrapper = async (event: SubmitEvent) => {
        event.preventDefault();
        handleSubmit(async (data) => {
          // submitPost will trigger 'postFormSuccess' on success,
          // which updates lastSavedBodyContent.
          await submitPost({ ...data, inlineQuotes });
        })();
      };

      parentForm.addEventListener("submit", formSubmitWrapper);
      return () => {
        parentForm.removeEventListener("submit", formSubmitWrapper);
      };
    }
  }, [formId, handleSubmit, submitPost, inlineQuotes]);

  // Prepare registration for bodyContent to combine with local ref
  const { ref: bodyContentRHFRef, ...bodyContentRestProps } = register("bodyContent");

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
            {...bodyContentRestProps} // Spread other props from register
            ref={(e) => {
              bodyContentRHFRef(e); // Call React Hook Form's ref function
              bodyContentRef.current = e as HTMLTextAreaElement | null; // Assign to your local ref
            }}
            rows={15}
            placeholder="Start writing your Markdown content here..."
          ></textarea>
        </div>
      </fieldset>
    </>
  );
};
export default PostForm;
