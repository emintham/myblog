import React from "react";
import type { RAGQueryResult } from "../../hooks/useRAGQuery";
import { formatScore } from "../../utils/formatting";
import { copyToClipboard, copyQuoteMarkdown } from "../../utils/clipboard";
import ResultCardActions from "./ResultCardActions";

interface QuoteResultCardProps {
  result: RAGQueryResult;
}

export default function QuoteResultCard({ result }: QuoteResultCardProps) {
  const { content, score, metadata } = result;

  const handleInsertQuote = async () => {
    await copyQuoteMarkdown({
      text: content,
      author: metadata.quoteAuthor || metadata.bookAuthor || "",
      source: metadata.quoteSource,
    });
  };

  const handleCopyText = async () => {
    await copyToClipboard(content);
  };

  const actions = [
    {
      label: "Insert Quote",
      onClick: handleInsertQuote,
      title: "Copy formatted quote",
    },
    {
      label: "Copy",
      onClick: handleCopyText,
      title: "Copy text to clipboard",
    },
  ];

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

      <ResultCardActions actions={actions} />
    </div>
  );
}
