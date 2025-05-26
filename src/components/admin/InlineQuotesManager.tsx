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
    <div className="form-field inline-quotes-manager" style={{ marginTop: '1.5rem' }}>
      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1em' }}>Inline Quotes</label>
      {quotes.map((quote, index) => (
        <div
          key={quote.id}
          className="quote-item"
          style={{
            borderBottom: '1px solid #e0e0e0', // Softer bottom border for separation
            paddingTop: '1rem',
            paddingBottom: '1rem',
            marginBottom: '1rem',
          }}
        >
          {/* Removed Quote # title for a cleaner look, can be re-added if needed */}
          {/* <h4 style={{ marginTop: '0', marginBottom: '0.75rem', fontSize: '0.9em', color: '#555' }}>Quote #{index + 1}</h4> */}
          <div className="form-field" style={{ marginBottom: '0.75rem' }}> {/* More compact margin */}
            <label htmlFor={`quote-text-${quote.id}`} style={{ fontSize: '0.9em', color: '#333' }}>Text*</label>
            <textarea
              id={`quote-text-${quote.id}`}
              value={quote.text}
              onChange={(e) => onUpdateQuoteField(quote.id, 'text', e.target.value)}
              rows={2} // More compact
              required
              style={{ fontSize: '0.95em', padding: '0.4rem' }}
            />
          </div>
          <div className="form-field" style={{ marginBottom: '0.75rem' }}>
            <label htmlFor={`quote-author-${quote.id}`} style={{ fontSize: '0.9em', color: '#333' }}>Author</label>
            <input
              type="text"
              id={`quote-author-${quote.id}`}
              value={quote.quoteAuthor || ''}
              onChange={(e) => onUpdateQuoteField(quote.id, 'quoteAuthor', e.target.value)}
              style={{ fontSize: '0.95em', padding: '0.4rem' }}
            />
          </div>
          <div className="form-field" style={{ marginBottom: '0.75rem' }}>
            <label htmlFor={`quote-source-${quote.id}`} style={{ fontSize: '0.9em', color: '#333' }}>Source/Context</label>
            <input
              type="text"
              id={`quote-source-${quote.id}`}
              value={quote.quoteSource || ''}
              onChange={(e) => onUpdateQuoteField(quote.id, 'quoteSource', e.target.value)}
              style={{ fontSize: '0.95em', padding: '0.4rem' }}
            />
          </div>
          <div className="form-field" style={{ marginBottom: '1rem' }}> {/* Slightly more margin before remove button */}
            <label htmlFor={`quote-tags-${quote.id}`} style={{ fontSize: '0.9em', color: '#333' }}>Tags (comma-separated)</label>
            <input
              type="text"
              id={`quote-tags-${quote.id}`}
              value={(quote.tags || []).join(', ')}
              onChange={(e) => {
                const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                onUpdateQuoteField(quote.id, 'tags', tagsArray);
              }}
              style={{ fontSize: '0.95em', padding: '0.4rem' }}
            />
          </div>
          <button
            type="button"
            onClick={() => onRemoveQuote(quote.id)}
            style={{
              background: 'none',
              border: '1px solid #ccc', // Softer border
              color: '#555', // Muted text color
              padding: '0.3rem 0.6rem',
              fontSize: '0.85em',
              borderRadius: '3px',
              cursor: 'pointer',
              marginRight: '0.5rem',
            }}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onAddQuote}
        style={{
          background: 'none',
          border: '1px solid #007bff', // Primary color border
          color: '#007bff', // Primary color text
          padding: '0.5rem 1rem',
          borderRadius: '3px',
          cursor: 'pointer',
          marginTop: '0.5rem', // Space above add button
          fontSize: '0.9em',
        }}
      >
        + Add Quote
      </button>
    </div>
  );
};

export default InlineQuotesManager;