// src/components/admin/PostForm.tsx
import React, { useState, useEffect } from 'react';

// (Keep PostData, PostFormProps interfaces, POST_TYPES, TODAY_ISO, formatDateForInput, formatTagsForInput as before)
export interface PostData { /* ... as before ... */ }
export interface PostFormProps { postData?: PostData; }
const POST_TYPES = ["standard", "fleeting", "bookNote"];
const TODAY_ISO = new Date().toISOString().split('T')[0];

const formatDateForInput = (date?: string | Date): string => { /* ... as before ... */
    if (!date) return TODAY_ISO;
    try { return new Date(date).toISOString().split('T')[0]; } catch (e) { return TODAY_ISO; }
};
const formatTagsForInput = (tags?: string | string[]): string => { /* ... as before ... */
    if (Array.isArray(tags)) return tags.join(', ');
    return tags || '';
};

const PostForm: React.FC<PostFormProps> = ({ postData = {} }) => {
  // Initial state setup using useState. This handles the defaults correctly for "create" mode
  // because postData.someField will be undefined, falling back to the || default.
  const [title, setTitle] = useState(postData.title || '');
  const [pubDate, setPubDate] = useState(formatDateForInput(postData.pubDate));
  const [description, setDescription] = useState(postData.description || '');
  const [postType, setPostType] = useState(postData.postType || 'standard');
  const [tags, setTags] = useState(formatTagsForInput(postData.tags));
  const [series, setSeries] = useState(postData.series || '');
  // For "create" mode (postData is {}), default draft to true. For "edit", use actual postData.draft.
  const [draft, setDraft] = useState(postData.hasOwnProperty('draft') ? !!postData.draft : true);
  const [bodyContent, setBodyContent] = useState(postData.bodyContent || '');

  const [bookTitle, setBookTitle] = useState(postData.bookTitle || '');
  const [bookAuthor, setBookAuthor] = useState(postData.bookAuthor || '');
  const [bookCoverImageName, setBookCoverImageName] = useState(postData.bookCover?.imageName || '');
  const [bookCoverAlt, setBookCoverAlt] = useState(postData.bookCover?.alt || '');
  const [quotesRef, setQuotesRef] = useState(postData.quotesRef || '');
  const [bookTags, setBookTags] = useState(formatTagsForInput(postData.bookTags));

  const [showBookNoteFields, setShowBookNoteFields] = useState(postType === 'bookNote');

  useEffect(() => {
    // This effect should ONLY re-populate the form if `postData` changes to reflect
    // a *different, existing post* (i.e., we are in "edit" mode and switching what's being edited,
    // or loading initial edit data).
    // It should NOT reset fields if `postData` is empty (create mode) and the user is typing.
    // The `useState` calls above already set the initial state correctly for both create and edit.

    // A good indicator that `postData` is for an actual loaded entity is the presence of
    // `originalSlug` or `originalFilePath`, which we add when loading data for editing.
    // Or, if `postData` is non-empty and its `title` is defined (more general).
    if (postData && (postData.originalSlug || (postData.title !== undefined && Object.keys(postData).length > 0) )) {
      setTitle(postData.title || '');
      setPubDate(formatDateForInput(postData.pubDate));
      setDescription(postData.description || '');
      const currentPostType = postData.postType || 'standard';
      setPostType(currentPostType);
      setTags(formatTagsForInput(postData.tags));
      setSeries(postData.series || '');
      // When editing, reflect the actual draft status. If undefined in data, default to false.
      setDraft(postData.hasOwnProperty('draft') ? !!postData.draft : false);
      setBodyContent(postData.bodyContent || '');

      setBookTitle(postData.bookTitle || '');
      setBookAuthor(postData.bookAuthor || '');
      setBookCoverImageName(postData.bookCover?.imageName || '');
      setBookCoverAlt(postData.bookCover?.alt || '');
      setQuotesRef(postData.quotesRef || '');
      setBookTags(formatTagsForInput(postData.bookTags));
    }
    // No 'else' block here that would reset fields for "create" mode.
    // The initial `useState` calls handle that.
  }, [postData]); // This effect still depends on the postData prop reference.

  useEffect(() => {
    setShowBookNoteFields(postType === 'bookNote');
  }, [postType]);

  return (
    <>
      {/* JSX for fieldsets and inputs remains the same as the previous PostForm.tsx version */}
      {/* ... fieldset for Core Information ... */}
      <fieldset>
        <legend>Core Information</legend>
        <div className="form-field"><label htmlFor="title">Title (Required)</label><input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
        <div className="form-field"><label htmlFor="pubDate">Publication Date</label><input type="date" id="pubDate" name="pubDate" value={pubDate} onChange={(e) => setPubDate(e.target.value)} required /></div>
        <div className="form-field"><label htmlFor="description">Description (Optional)</label><textarea id="description" name="description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea></div>
        <div className="form-field">
          <label htmlFor="postType">Post Type</label>
          <select id="postType" name="postType" value={postType} onChange={(e) => setPostType(e.target.value)}>
            {POST_TYPES.map(type => (<option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>))}
          </select>
        </div>
      </fieldset>
      {/* ... fieldset for Metadata ... */}
      <fieldset>
        <legend>Metadata</legend>
        <div className="form-field"><label htmlFor="tags">Tags (Optional, comma-separated)</label><input type="text" id="tags" name="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g., tech, philosophy, life" /></div>
        <div className="form-field"><label htmlFor="series">Series (Optional)</label><input type="text" id="series" name="series" value={series} onChange={(e) => setSeries(e.target.value)} placeholder="e.g., My Learning Journey" /></div>
        <div className="form-field"><label><input type="checkbox" id="draft" name="draft" checked={draft} onChange={(e) => setDraft(e.target.checked)} />Mark as Draft</label></div>
      </fieldset>
      {/* ... fieldset for Book Note Details (conditionally rendered) ... */}
      {showBookNoteFields && (
        <fieldset id="formBookNoteFieldsReact" className="book-note-fields">
          <legend>Book Note Details</legend>
          <div className="form-field"><label htmlFor="bookTitle">Book Title</label><input type="text" id="bookTitle" name="bookTitle" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} /></div>
          <div className="form-field"><label htmlFor="bookAuthor">Book Author</label><input type="text" id="bookAuthor" name="bookAuthor" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} /></div>
          <div className="form-field"><label htmlFor="bookCoverImageName">Book Cover Image Name</label><input type="text" id="bookCoverImageName" name="bookCoverImageName" value={bookCoverImageName} onChange={(e) => setBookCoverImageName(e.target.value)} placeholder="e.g., meditations-cover" /></div>
          <div className="form-field"><label htmlFor="bookCoverAlt">Book Cover Alt Text</label><input type="text" id="bookCoverAlt" name="bookCoverAlt" value={bookCoverAlt} onChange={(e) => setBookCoverAlt(e.target.value)} /></div>
          <div className="form-field"><label htmlFor="quotesRef">Quotes Reference</label><input type="text" id="quotesRef" name="quotesRef" value={quotesRef} onChange={(e) => setQuotesRef(e.target.value)} placeholder="e.g., meditations-quotes" /></div>
          <div className="form-field"><label htmlFor="bookTags">Book Tags</label><input type="text" id="bookTags" name="bookTags" value={bookTags} onChange={(e) => setBookTags(e.target.value)} placeholder="e.g., stoicism, philosophy" /></div>
        </fieldset>
      )}
      {/* ... fieldset for Body Content ... */}
      <fieldset>
          <legend>Body Content</legend>
          <div className="form-field"><label htmlFor="bodyContent">Post Body (Markdown)</label><textarea id="bodyContent" name="bodyContent" value={bodyContent} onChange={(e) => setBodyContent(e.target.value)} rows={15} placeholder="Start writing your Markdown content here..."></textarea></div>
      </fieldset>
    </>
  );
};
export default PostForm;
