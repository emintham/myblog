import React from "react";
import type { Quote } from "../../../types/admin";
import TagsComponent from "./TagsComponent"; // Import TagsComponent

interface InlineQuotesManagerProps {
  quotes: Quote[];
  onAddQuote: () => void;
  onRemoveQuote: (id: string) => void;
  onUpdateQuoteField: <K extends keyof Omit<Quote, "id">>(
    id: string,
    field: K,
    value: Quote[K]
  ) => void;
  allQuoteTags?: string[]; // Optional: All unique quote tags for suggestions
}

const InlineQuotesManager: React.FC<InlineQuotesManagerProps> = ({
  quotes,
  onAddQuote,
  onRemoveQuote,
  onUpdateQuoteField,
  allQuoteTags, // Destructure the new prop
}) => {
  return (
    <div className="form-field inline-quotes-manager">
      <label className="inline-quotes-label">Inline Quotes</label>
      {quotes.map((quote) => (
        <div key={quote.id} className="quote-item">
          <div className="form-field">
            <label htmlFor={`quote-text-${quote.id}`}>Text*</label>
            <textarea
              id={`quote-text-${quote.id}`}
              value={quote.text}
              onChange={(e) =>
                onUpdateQuoteField(quote.id, "text", e.target.value)
              }
              rows={2}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor={`quote-author-${quote.id}`}>Author</label>
            <input
              type="text"
              id={`quote-author-${quote.id}`}
              value={quote.quoteAuthor || ""}
              onChange={(e) =>
                onUpdateQuoteField(quote.id, "quoteAuthor", e.target.value)
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor={`quote-source-${quote.id}`}>Source/Context</label>
            <input
              type="text"
              id={`quote-source-${quote.id}`}
              value={quote.quoteSource || ""}
              onChange={(e) =>
                onUpdateQuoteField(quote.id, "quoteSource", e.target.value)
              }
            />
          </div>
          <div className="form-field tags-field-container">
            {/* <label htmlFor={`quote-tags-${quote.id}`}>Tags (comma-separated)</label>
            <input ... /> */}
            <TagsComponent
              id={`quote-tags-${quote.id}`}
              label="Tags"
              value={quote.tags || []} // Quote.tags is already string[]
              onChange={(newTags) =>
                onUpdateQuoteField(quote.id, "tags", newTags)
              }
              suggestions={allQuoteTags} // Prop passed from PostForm
              placeholder="Add quote tags"
              // onBlur is not strictly needed here unless RHF validation is directly on this sub-field
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
      <button type="button" onClick={onAddQuote} className="button-add-quote">
        + Add Quote
      </button>
    </div>
  );
};

export default InlineQuotesManager;
