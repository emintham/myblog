import { useState, useCallback } from "react";
import {
  extractErrorMessage,
  validateFetchResponse,
} from "../utils/api-helpers";

export interface RAGQueryResult {
  content: string;
  score: number;
  metadata: {
    slug?: string;
    title?: string;
    postType?: string;
    paragraphIndex?: number;
    tags?: string[];
    series?: string;
    pubDate?: string;
    quotesRef?: string;
    bookTitle?: string;
    bookAuthor?: string;
    quoteAuthor?: string;
    quoteSource?: string;
  };
  url?: string;
}

export interface RAGQueryResponse {
  results: RAGQueryResult[];
  queryTime: number;
  count: number;
}

interface UseRAGQueryOptions {
  topK?: number;
  contentType?: "posts" | "quotes" | "all";
}

export function useRAGQuery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<RAGQueryResult[]>([]);
  const [queryTime, setQueryTime] = useState<number>(0);

  const query = useCallback(
    async (queryText: string, options: UseRAGQueryOptions = {}) => {
      if (!queryText || queryText.trim() === "") {
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/rag-query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: queryText,
            topK: options.topK || 10,
            filter: {
              contentType: options.contentType || "all",
            },
          }),
        });

        await validateFetchResponse(response, "Query");

        const data: { data: RAGQueryResponse } = await response.json();
        setResults(data.data.results);
        setQueryTime(data.data.queryTime);
      } catch (err) {
        setError(extractErrorMessage(err));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    setQueryTime(0);
  }, []);

  return {
    query,
    clear,
    isLoading,
    error,
    results,
    queryTime,
  };
}
