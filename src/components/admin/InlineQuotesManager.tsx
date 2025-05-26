import React from 'react';
import type { Quote } from '../../types/admin';

interface InlineQuotesManagerProps {
  quotes: Quote[];
  onAddQuote: () => void;
  onRemoveQuote: (id: string) => void;
  onUpdateQuoteField: <K extends keyof Omit<Quote, 'id'>>(id: string, field: K, value: Quote[K]) => void;
}

const InlineQuotesManager: React.FC<InlineQuotesManagerProps> = ({
  quotes,
  onAddQuote,
  onRemoveQuote,
  onUpdateQuoteField,
}) => {
  return (
    <div className="form-field inline-quotes-manager">
      <label className="inline-quotes-label">Inline Quotes</label>
      {quotes.map((quote) => (
        <div
          key={quote.id}
          className="quote-item"
        >
          <div className="form-field">
            <label htmlFor={`quote-text-${quote.id}`}>Text*</label>
            <textarea
              id={`quote-text-${quote.id}`}
              value={quote.text}
              onChange={(e) => onUpdateQuoteField(quote.id, 'text', e.target.value)}
              rows={2}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor={`quote-author-${quote.id}`}>Author</label>
            <input
              type="text"
              id={`quote-author-${quote.id}`}
              value={quote.quoteAuthor || ''}
              onChange={(e) => onUpdateQuoteField(quote.id, 'quoteAuthor', e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor={`quote-source-${quote.id}`}>Source/Context</label>
            <input
              type="text"
              id={`quote-source-${quote.id}`}
              value={quote.quoteSource || ''}
              onChange={(e) => onUpdateQuoteField(quote.id, 'quoteSource', e.target.value)}
            />
          </div>
          <div className="form-field tags-field-container">
            <label htmlFor={`quote-tags-${quote.id}`}>Tags (comma-separated)</label>
            <input
              type="text"
              id={`quote-tags-${quote.id}`}
              value={(quote.tags || []).join(', ')}
              onChange={(e) => {
                // Allow commas and spaces during typing.
                // Split by comma, trim each part, but don't filter out empty strings yet
                // to allow typing "tag1, tag2, " before the next tag.
                // The final filtering of empty tags can happen on blur or submission if needed,
                // but for live state update, this is more permissive.
                const tagsArray = e.target.value.split(',').map(tag => tag.trim());
                // If the input is empty, treat as an empty array rather than [""]
                if (e.target.value === '') {
                    onUpdateQuoteField(quote.id, 'tags', []);
                } else if (e.target.value.endsWith(',')) {
                    // If the user just typed a comma, add an empty string to represent the next potential tag
                    // and to ensure the comma is preserved by the join(', ') for the value.
                    onUpdateQuoteField(quote.id, 'tags', [...tagsArray, '']);
                }
                else {
                    onUpdateQuoteField(quote.id, 'tags', tagsArray.filter(tag => tag !== '' || tagsArray.length === 1));
                }
              }}
              onBlur={(e) => {
                // On blur, clean up the tags: split, trim, and filter empty ones.
                const tagsArray = e.target.value.split(',')
                  .map(tag => tag.trim())
                  .filter(tag => tag); // Filter empty strings on blur
                onUpdateQuoteField(quote.id, 'tags', tagsArray);
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemoveQuote(quote.id)}
            className="button-remove-quote"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAddQuote}
        className="button-add-quote"
      >
        + Add Quote
      </button>
    </div>
  );
};

export default InlineQuotesManager;