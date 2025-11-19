import React, { useState } from "react";
import CollapsibleSection from "../shared/CollapsibleSection";
import { formatDateWithTime } from "../../../utils/formatting";
import {
  extractErrorMessage,
  validateFetchResponse,
} from "../../../utils/api-helpers";

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
  const [statsData, setStatsData] = useState<IndexStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleExpandedChange = (isExpanded: boolean) => {
    if (isExpanded && !statsData && !error) {
      fetchStats();
    }
  };

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/rag-stats");
      await validateFetchResponse(response, "Fetch stats");
      const result: { data: IndexStatsData } = await response.json();
      setStatsData(result.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CollapsibleSection
      title="RAG Index Statistics"
      defaultExpanded={false}
      className="index-stats-section"
      onExpandedChange={handleExpandedChange}
    >
      {isLoading && <p className="loading">Loading statistics...</p>}

      {error && <p className="error">Error: {error}</p>}

      {!isLoading && !error && statsData && (
        <>
          {!statsData.initialized ? (
            <p className="not-initialized">
              RAG index not initialized. Run <code>pnpm rrb</code> to build the
              index.
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
                    <dd>{formatDateWithTime(statsData.stats.lastUpdated)}</dd>
                  </dl>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </CollapsibleSection>
  );
}
