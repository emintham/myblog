import React, { useState, useEffect } from "react";

interface IndexStatsData {
  initialized: boolean;
  version?: string;
  embeddingModel?: string;
  embeddingDim?: number;
  provider?: string;
  stats?: {
    totalPosts: number;
    totalParagraphs: number;
    totalQuotes: number;
    lastUpdated: string;
  };
}

export default function IndexStats() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statsData, setStatsData] = useState<IndexStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/rag-stats");
        if (!response.ok) {
          throw new Error(`Failed to fetch stats: ${response.statusText}`);
        }
        const result: { data: IndexStatsData } = await response.json();
        setStatsData(result.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (isExpanded) {
      fetchStats();
    }
  }, [isExpanded]);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="index-stats-section collapsible-section">
      <button
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
      >
        <h2>RAG Index Statistics</h2>
        <span className="toggle-icon">{isExpanded ? "−" : "+"}</span>
      </button>

      {isExpanded && (
        <div className="section-content">
          {isLoading && <p className="loading">Loading statistics...</p>}

          {error && <p className="error">Error: {error}</p>}

          {!isLoading && !error && statsData && (
            <>
              {!statsData.initialized ? (
                <p className="not-initialized">
                  RAG index not initialized. Run <code>pnpm rrb</code> to build
                  the index.
                </p>
              ) : (
                <div className="stats-grid">
                  <div className="stats-section">
                    <h3>Embedding Configuration</h3>
                    <dl>
                      <dt>Provider:</dt>
                      <dd>{statsData.provider}</dd>
                      <dt>Model:</dt>
                      <dd>{statsData.embeddingModel}</dd>
                      <dt>Dimensions:</dt>
                      <dd>{statsData.embeddingDim}</dd>
                      <dt>Version:</dt>
                      <dd>{statsData.version}</dd>
                    </dl>
                  </div>

                  {statsData.stats && (
                    <div className="stats-section">
                      <h3>Content Statistics</h3>
                      <dl>
                        <dt>Total Posts:</dt>
                        <dd>{statsData.stats.totalPosts}</dd>
                        <dt>Total Paragraphs:</dt>
                        <dd>{statsData.stats.totalParagraphs}</dd>
                        <dt>Total Quotes:</dt>
                        <dd>{statsData.stats.totalQuotes}</dd>
                        <dt>Last Updated:</dt>
                        <dd>{formatDate(statsData.stats.lastUpdated)}</dd>
                      </dl>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
