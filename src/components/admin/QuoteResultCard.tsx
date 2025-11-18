import React from "react";
import type { RAGQueryResult } from "../../hooks/useRAGQuery";

interface QuoteResultCardProps {
  result: RAGQueryResult;
}

export default function QuoteResultCard({ result }: QuoteResultCardProps) {
  const { content, score, metadata } = result;

  const handleInsertQuote = () => {
    const quoteMarkdown = `> ${content}\n> \n> — ${metadata.quoteAuthor || metadata.bookAuthor}${metadata.quoteSource ? `, ${metadata.quoteSource}` : ""}`;
    navigator.clipboard.writeText(quoteMarkdown);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(content);
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(0);
  };

  return (
    <div className="result-card quote-result-card">
      <div className="result-header">
        <div className="result-title-row">
          <h3 className="result-title">
            <span className="result-icon">💬</span>
            Quote from "{metadata.bookTitle}"
          </h3>
          <span className="result-score">{formatScore(score)}%</span>
        </div>
        <div className="result-metadata">
          <span className="result-author">by {metadata.bookAuthor}</span>
          {metadata.quoteAuthor &&
            metadata.quoteAuthor !== metadata.bookAuthor && (
              <span className="result-quote-author">
                quoted: {metadata.quoteAuthor}
              </span>
            )}
          {metadata.quoteSource && (
            <span className="result-quote-source">{metadata.quoteSource}</span>
          )}
        </div>
      </div>

      <div className="result-content quote-content">
        <blockquote>{content}</blockquote>
      </div>

      {metadata.tags && metadata.tags.length > 0 && (
        <div className="result-tags">
          {metadata.tags.map((tag) => (
            <span key={tag} className="result-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="result-actions">
        <button
          onClick={handleInsertQuote}
          className="action-button"
          title="Copy formatted quote"
        >
          Insert Quote
        </button>
        <button
          onClick={handleCopyText}
          className="action-button"
          title="Copy text to clipboard"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
