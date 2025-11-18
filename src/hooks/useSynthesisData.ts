import { useState, useEffect, useCallback } from "react";

export interface FleetingThought {
  slug: string;
  title: string;
  relatedCount: number;
  relatedPosts: Array<{
    slug: string;
    title: string;
    score: number;
  }>;
}

export interface OrphanedContent {
  slug: string;
  title: string;
  postType: string;
  connectionCount: number;
}

export interface UnreferencedQuote {
  quotesRef: string;
  bookTitle: string;
  bookAuthor: string;
  quoteText: string;
  quoteIndex: number;
}

export interface SynthesisData {
  fleetingThoughts: FleetingThought[];
  orphanedContent: OrphanedContent[];
  unreferencedQuotes: UnreferencedQuote[];
  counts: {
    fleetingThoughts: number;
    orphanedContent: number;
    unreferencedQuotes: number;
  };
}

export function useSynthesisData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SynthesisData | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rag-synthesis");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch synthesis data: ${response.statusText}`
        );
      }

      const result: { data: SynthesisData } = await response.json();
      setData(result.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    isLoading,
    error,
    data,
    refetch: fetchData,
  };
}
