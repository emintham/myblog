import React from "react";
import { useRAGQuery } from "../../../hooks/useRAGQuery";
import { useSynthesisData } from "../../../hooks/useSynthesisData";
import SemanticSearchBox from "./SemanticSearchBox";
import UnifiedSearchResults from "./UnifiedSearchResults";
import SynthesisOpportunities from "./SynthesisOpportunities";
import IndexStats from "./IndexStats";

export default function ContentIntelligenceDashboard() {
  const {
    query,
    isLoading: isSearching,
    error: searchError,
    results,
    queryTime,
  } = useRAGQuery();

  const {
    isLoading: isSynthesisLoading,
    error: synthesisError,
    data: synthesisData,
  } = useSynthesisData();

  const handleSearch = (queryText: string) => {
    query(queryText);
  };

  return (
    <div className="content-intelligence-dashboard">
      <header className="dashboard-header">
        <h1>Content Intelligence Dashboard</h1>
        <p className="dashboard-description">
          Discover connections across your content, find synthesis
          opportunities, and explore your knowledge base through semantic
          search.
        </p>
      </header>

      <section className="search-section">
        <SemanticSearchBox onSearch={handleSearch} isLoading={isSearching} />
        <UnifiedSearchResults
          results={results}
          queryTime={queryTime}
          isLoading={isSearching}
          error={searchError}
        />
      </section>

      <section className="insights-section">
        <SynthesisOpportunities
          data={synthesisData}
          isLoading={isSynthesisLoading}
        />
        <IndexStats />
      </section>

      {synthesisError && (
        <div className="error-message">
          <p>Failed to load synthesis data: {synthesisError}</p>
        </div>
      )}
    </div>
  );
}
