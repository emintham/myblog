import React from "react";
import type { RAGQueryResult } from "../../hooks/useRAGQuery";

interface PostResultCardProps {
  result: RAGQueryResult;
}

export default function PostResultCard({ result }: PostResultCardProps) {
  const { content, score, metadata, url } = result;

  const handleOpenInEditor = () => {
    if (metadata.slug) {
      window.open(`/admin/edit/${metadata.slug}`, "_blank");
    }
  };

  const handleInsertLink = () => {
    if (url) {
      navigator.clipboard.writeText(`[${metadata.title}](${url})`);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(content);
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="result-card post-result-card">
      <div className="result-header">
        <div className="result-title-row">
          <h3 className="result-title">
            <span className="result-icon">📝</span>
            {metadata.title}
          </h3>
          <span className="result-score">{formatScore(score)}%</span>
        </div>
        <div className="result-metadata">
          <span className="result-type">{metadata.postType}</span>
          {metadata.series && (
            <span className="result-series">Series: {metadata.series}</span>
          )}
          {formatDate(metadata.pubDate) && (
            <span className="result-date">{formatDate(metadata.pubDate)}</span>
          )}
        </div>
      </div>

      <div className="result-content">
        <p>{content}</p>
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
          onClick={handleOpenInEditor}
          className="action-button"
          title="Open in editor"
        >
          Open
        </button>
        <button
          onClick={handleInsertLink}
          className="action-button"
          title="Copy markdown link"
        >
          Insert Link
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
