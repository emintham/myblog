import React from "react";
import type { RAGQueryResult } from "../../hooks/useRAGQuery";
import PostResultCard from "./PostResultCard";
import QuoteResultCard from "./QuoteResultCard";

interface UnifiedSearchResultsProps {
  results: RAGQueryResult[];
  queryTime: number;
  isLoading: boolean;
  error: string | null;
}

export default function UnifiedSearchResults({
  results,
  queryTime,
  isLoading,
  error,
}: UnifiedSearchResultsProps) {
  // Determine if a result is a quote or a post based on metadata
  const isQuoteResult = (result: RAGQueryResult) => {
    return !!result.metadata.quotesRef;
  };

  if (isLoading) {
    return (
      <div className="search-results">
        <div className="search-status loading">
          <span>Searching...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results">
        <div className="search-status error">
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="search-results">
        <div className="search-status empty">
          <p>No results found. Try a different search query.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-status success">
        <span>
          Found {results.length} result{results.length !== 1 ? "s" : ""} in{" "}
          {queryTime}ms
        </span>
      </div>

      <div className="results-list">
        {results.map((result, index) => {
          if (isQuoteResult(result)) {
            return <QuoteResultCard key={index} result={result} />;
          } else {
            return <PostResultCard key={index} result={result} />;
          }
        })}
      </div>
    </div>
  );
}
