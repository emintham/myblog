// src/components/admin/PostForm.tsx
import React, { useEffect, useState }  from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';

// Interface for actual post data structure (could be from a DB or API)
export interface PostSourceData {
  title?: string;
  pubDate?: string | Date; // Can be Date object or ISO string
  description?: string;
  postType?: string;
  tags?: string | string[]; // Can be array or comma-separated string
  series?: string;
  draft?: boolean;
  bodyContent?: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookCover?: { imageName?: string; alt?: string }; // Nested object
  quotesRef?: string;
  bookTags?: string | string[]; // Can be array or comma-separated string
  originalSlug?: string;
  originalFilePath?: string;
  originalExtension?: string;
}

// Interface for form data structure (flat for react-hook-form)
export interface PostFormData {
  title: string;
  pubDate: string; // Always string for date input
  description: string;
  postType: string;
  tags: string; // Always comma-separated string for input
  series: string;
  draft: boolean;
  bodyContent: string;
  bookTitle: string;
  bookAuthor: string;
  bookCoverImageName: string; // Flat structure for form
  bookCoverAlt: string;       // Flat structure for form
  quotesRef: string;
  bookTags: string; // Always comma-separated string for input
  // These are included if they are part of postData and might be needed for submission (like originalSlug)
  originalSlug?: string;
  originalFilePath?: string;
  originalExtension?: string;
}

export interface PostFormProps {
  postData?: PostSourceData; // Data from source, optional for create mode
  formId: string; // ID of the parent <form> element
  // Callbacks are now handled by custom events dispatched on `window`
  // e.g., 'postFormSuccess', 'postFormError', 'postFormSubmitting'
}

const POST_TYPES = ["standard", "fleeting", "bookNote"];
const TODAY_ISO = new Date().toISOString().split('T')[0];

const formatDateForInput = (date?: string | Date): string => {
    if (!date) return TODAY_ISO;
    try {
        return new Date(date).toISOString().split('T')[0];
    } catch (e) {
        return TODAY_ISO;
    }
};

const formatTagsForInput = (tags?: string | string[]): string => {
    if (Array.isArray(tags)) return tags.join(', ');
    return tags || '';
};

const defaultValues: PostFormData = {
  title: '',
  pubDate: TODAY_ISO,
  description: '',
  postType: 'standard',
  tags: '',
  series: '',
  draft: true,
  bodyContent: '',
  bookTitle: '',
  bookAuthor: '',
  bookCoverImageName: '',
  bookCoverAlt: '',
  quotesRef: '',
  bookTags: '',
  originalSlug: undefined,
  originalFilePath: undefined,
  originalExtension: undefined,
};

const PostForm: React.FC<PostFormProps> = ({
    postData,
    formId
    // onSubmitting, (Removed, use event 'postFormSubmitting')
    // onSubmissionSuccess, (Removed, use event 'postFormSuccess')
    // onSubmissionError (Removed, use event 'postFormError')
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  }: UseFormReturn<PostFormData> = useForm<PostFormData>({
    defaultValues,
    mode: "onSubmit", // Validate on submit
    reValidateMode: "onChange" // Re-validate on change after first submission attempt
  });

  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  const watchedPostType = watch('postType', defaultValues.postType);
  const [showBookNoteFieldsUI, setShowBookNoteFieldsUI] = useState(watchedPostType === 'bookNote');

  useEffect(() => {
    setShowBookNoteFieldsUI(watchedPostType === 'bookNote');
  }, [watchedPostType]);

  useEffect(() => {
    if (postData && postData.originalSlug) {
      const transformedData: PostFormData = {
        title: postData.title || '',
        pubDate: formatDateForInput(postData.pubDate),
        description: postData.description || '',
        postType: postData.postType || 'standard',
        tags: formatTagsForInput(postData.tags),
        series: postData.series || '',
        draft: postData.hasOwnProperty('draft') ? !!postData.draft : false,
        bodyContent: postData.bodyContent || '',
        bookTitle: postData.bookTitle || '',
        bookAuthor: postData.bookAuthor || '',
        bookCoverImageName: postData.bookCover?.imageName || '',
        bookCoverAlt: postData.bookCover?.alt || '',
        quotesRef: postData.quotesRef || '',
        bookTags: formatTagsForInput(postData.bookTags),
        originalSlug: postData.originalSlug,
        originalFilePath: postData.originalFilePath,
        originalExtension: postData.originalExtension,
      };
      reset(transformedData);
    } else {
      reset(defaultValues);
    }
  }, [postData, reset]);

  const internalOnSubmit = async (formData: PostFormData) => {
    setIsSubmittingLocal(true);
    // if (onSubmitting) onSubmitting(true);
    window.dispatchEvent(new CustomEvent('postFormSubmitting', { detail: { isSubmitting: true } }));

    let apiEndpoint = '';
    let actionType: 'create' | 'update' = 'create';
    const payload: any = { ...formData };

    if (formData.bookCoverImageName || formData.bookCoverAlt) {
      payload.bookCover = {
        imageName: formData.bookCoverImageName,
        alt: formData.bookCoverAlt,
      };
    }
    delete payload.bookCoverImageName;
    delete payload.bookCoverAlt;

    if (postData?.originalSlug) {
      actionType = 'update';
      apiEndpoint = '/api/update-post-handler';
      payload.originalSlug = postData.originalSlug;
      payload.originalFilePath = postData.originalFilePath;
      payload.originalExtension = postData.originalExtension;
    } else {
      actionType = 'create';
      apiEndpoint = '/api/create-post-handler';
      delete payload.originalSlug;
      delete payload.originalFilePath;
      delete payload.originalExtension;
    }

    console.log(`[${actionType.toUpperCase()}] Attempting to submit to endpoint: ${apiEndpoint}`);
    console.log(`[${actionType.toUpperCase()}] Payload:`, JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log(`[${actionType.toUpperCase()}] Raw API Response Status: ${response.status}`);
      console.log(`[${actionType.toUpperCase()}] Raw API Response Headers:`, response.headers);

      const result = await response.json();
      console.log(`[${actionType.toUpperCase()}] Parsed API Response:`, result);

      if (response.ok) {
        // if (onSubmissionSuccess) onSubmissionSuccess(result, actionType);
        window.dispatchEvent(new CustomEvent('postFormSuccess', { detail: { result, actionType } }));
        // If create action, reset form. For update, data persists.
        if (actionType === 'create') {
          reset(defaultValues);
        }
      } else {
        console.error(`[${actionType.toUpperCase()}] API Error (after parsing):`, result.message || response.statusText, result);
        // if (onSubmissionError) onSubmissionError(result, actionType);
        window.dispatchEvent(new CustomEvent('postFormError', { detail: { error: result, actionType } }));
      }
    } catch (error: any) {
      console.error(`[${actionType.toUpperCase()}] Error during fetch or JSON parsing:`, error);
      if (error instanceof Error) {
        console.error(`[${actionType.toUpperCase()}] Error name: ${error.name}, message: ${error.message}`);
      }
      // if (onSubmissionError) onSubmissionError(error, actionType);
      window.dispatchEvent(new CustomEvent('postFormError', { detail: { error, actionType } }));
    } finally {
      setIsSubmittingLocal(false);
      // if (onSubmitting) onSubmitting(false);
      window.dispatchEvent(new CustomEvent('postFormSubmitting', { detail: { isSubmitting: false } }));
    }
  };

  useEffect(() => {
    const parentForm = document.getElementById(formId);
    if (parentForm && parentForm instanceof HTMLFormElement) {
      // Create a wrapper for the react-hook-form submit handler
      const formSubmitWrapper = (event: SubmitEvent) => {
        // Prevent default form submission.
        if (event) event.preventDefault();
        // Call the RHF handler. It doesn't need the event passed to it here,
        // as it's already configured with the callback.
        handleSubmit(internalOnSubmit)();
      };

      parentForm.addEventListener('submit', formSubmitWrapper);
      return () => {
        parentForm.removeEventListener('submit', formSubmitWrapper);
      };
    }
  }, [formId, handleSubmit, internalOnSubmit]); // internalOnSubmit needs to be stable or wrapped in useCallback if it causes re-runs

  return (
    <>
      {/* Fieldset for Core Information */}
      <fieldset>
        <legend>Core Information</legend>
        <div className="form-field">
          <label htmlFor="title">Title (Required)</label>
          <input type="text" id="title" {...register('title', { required: "Title is required" })} />
          {errors.title && <span className="field-error-message">{errors.title.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="pubDate">Publication Date (Required)</label>
          <input type="date" id="pubDate" {...register('pubDate', {
            required: "Publication date is required",
            valueAsDate: true, // Ensures RHF treats it as a date for potential date-specific validation
           })} />
          {errors.pubDate && <span className="field-error-message">{errors.pubDate.message}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="description">Description (Optional)</label>
          <textarea id="description" {...register('description')}></textarea>
        </div>
        <div className="form-field">
          <label htmlFor="postType">Post Type</label>
          <select id="postType" {...register('postType')}>
            {POST_TYPES.map(type => (<option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>))}
          </select>
        </div>
      </fieldset>

      {/* Fieldset for Metadata */}
      <fieldset>
        <legend>Metadata</legend>
        <div className="form-field">
          <label htmlFor="tags">Tags (Optional, comma-separated)</label>
          <input type="text" id="tags" {...register('tags')} placeholder="e.g., tech, philosophy, life" />
        </div>
        <div className="form-field">
          <label htmlFor="series">Series (Optional)</label>
          <input type="text" id="series" {...register('series')} placeholder="e.g., My Learning Journey" />
        </div>
        <div className="form-field">
          <label>
            <input type="checkbox" id="draft" {...register('draft')} />
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
            <input type="text" id="bookTitle" {...register('bookTitle')} />
          </div>
          <div className="form-field">
            <label htmlFor="bookAuthor">Book Author</label>
            <input type="text" id="bookAuthor" {...register('bookAuthor')} />
          </div>
          <div className="form-field">
            <label htmlFor="bookCoverImageName">Book Cover Image Name</label>
            <input type="text" id="bookCoverImageName" {...register('bookCoverImageName')} placeholder="e.g., meditations-cover" />
          </div>
          <div className="form-field">
            <label htmlFor="bookCoverAlt">Book Cover Alt Text</label>
            <input type="text" id="bookCoverAlt" {...register('bookCoverAlt')} />
          </div>
          <div className="form-field">
            <label htmlFor="quotesRef">Quotes Reference</label>
            <input type="text" id="quotesRef" {...register('quotesRef')} placeholder="e.g., meditations-quotes" />
          </div>
          <div className="form-field">
            <label htmlFor="bookTags">Book Tags</label>
            <input type="text" id="bookTags" {...register('bookTags')} placeholder="e.g., stoicism, philosophy" />
          </div>
        </fieldset>
      )}

      {/* Fieldset for Body Content */}
      <fieldset>
          <legend>Body Content</legend>
          <div className="form-field">
            <label htmlFor="bodyContent">Post Body (Markdown)</label>
            <textarea id="bodyContent" {...register('bodyContent')} rows={15} placeholder="Start writing your Markdown content here..."></textarea>
          </div>
      </fieldset>
    </>
  );
};
export default PostForm;

