import React from "react";
import type { RAGQueryResult } from "../../hooks/useRAGQuery";
import { formatScore, formatDate } from "../../utils/formatting";
import { copyToClipboard, copyMarkdownLink } from "../../utils/clipboard";
import { openInEditor } from "../../utils/navigation";
import ResultCardActions from "./ResultCardActions";

interface PostResultCardProps {
  result: RAGQueryResult;
}

export default function PostResultCard({ result }: PostResultCardProps) {
  const { content, score, metadata, url } = result;

  const handleOpenInEditor = () => {
    if (metadata.slug) {
      openInEditor(metadata.slug);
    }
  };

  const handleInsertLink = async () => {
    if (url && metadata.title) {
      await copyMarkdownLink(metadata.title, url);
    }
  };

  const handleCopyText = async () => {
    await copyToClipboard(content);
  };

  const actions = [
    {
      label: "Open",
      onClick: handleOpenInEditor,
      title: "Open in editor",
    },
    {
      label: "Insert Link",
      onClick: handleInsertLink,
      title: "Copy markdown link",
    },
    {
      label: "Copy",
      onClick: handleCopyText,
      title: "Copy text to clipboard",
    },
  ];

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

      <ResultCardActions actions={actions} />
    </div>
  );
}
