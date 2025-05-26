import React, { useEffect, useState, useCallback }  from 'react'; // Added useCallback
import { useForm, type UseFormReturn } from 'react-hook-form';
import type { PostSourceData, PostFormData } from '../../types/admin';
import { usePostSubmission } from '../../hooks/usePostSubmission'; // Import the new hook

export interface PostFormProps {
  postData?: PostSourceData; // Data from source, optional for create mode
  formId: string; // ID of the parent <form> element
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
}) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues, // Add getValues
    formState: { errors },
  }: UseFormReturn<PostFormData> = useForm<PostFormData>({
    defaultValues,
    mode: "onSubmit", // Validate on submit
    reValidateMode: "onChange" // Re-validate on change after first submission attempt
  });

  // Use the new hook
  const { submitPost, isSubmitting: isSubmittingHook } = usePostSubmission({
    existingPostData: postData,
    resetForm: reset,
    defaultFormValues: defaultValues
  });

  // Expose isSubmitting state from the hook if needed by parent or other parts of this component
  // For now, PostForm itself doesn't directly use isSubmittingLocal for UI changes,
  // as that's handled by the event listeners in Astro pages.
  // If PostForm needed to change its own UI based on submission state, use isSubmittingHook.

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

  // The submitPost function from the hook is already stable due to useCallback in the hook.
  // We pass it directly to handleSubmit.
  // const onFormSubmit = handleSubmit(submitPost); // We will call submitPost directly

  useEffect(() => {
    const parentForm = document.getElementById(formId);
    if (parentForm && parentForm instanceof HTMLFormElement) {
      const formSubmitWrapper = async (event: SubmitEvent) => {
        event.preventDefault(); // Explicitly prevent default
        // Manually trigger validation and then submission if valid
        const isValid = await handleSubmit(submitPost)(); // This triggers validation
        // Note: handleSubmit(submitPost)() will call submitPost if validation passes.
        // If we don't want to rely on its internal call due to the manual setup,
        // we could do:
        // const isValid = await trigger(); // trigger validation for all fields
        // if (isValid) {
        //   submitPost(getValues());
        // }
        // For now, let's stick to the simpler handleSubmit()() which should work.
      };

      parentForm.addEventListener('submit', formSubmitWrapper);
      return () => {
        parentForm.removeEventListener('submit', formSubmitWrapper);
      };
    }
  }, [formId, handleSubmit, submitPost, getValues]); // Added getValues to dependencies

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

