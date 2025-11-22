/**
 * Hook for managing Lexi text analysis
 * Handles fetching analysis results and managing state
 */

import { useState, useCallback, useEffect } from "react";
import { extractErrorMessage } from "../utils/api-helpers";

// Lexi metrics
export const LEXI_METRICS = [
  "vocabulary_diversity",
  "sentence_structure_variety",
  "semantic_pacing_vectors",
  "adverb_usage",
  "sentiment_arc",
  "cognitive_load",
] as const;

export type LexiMetric = (typeof LEXI_METRICS)[number];

// Metric display names and descriptions
export const METRIC_INFO: Record<
  LexiMetric,
  {
    name: string;
    description: string;
    tooltip: string;
    format: (v: unknown) => string;
  }
> = {
  vocabulary_diversity: {
    name: "Vocabulary Diversity",
    description: "MATTR within 50-word windows",
    tooltip: `How often you repeat words within a 50-word window.

• Standard: 70-80%
• Repetitive: <65% - reusing "crutch" words (think, just, very)
• Rich: >85% - high lexical density, common in descriptive fiction`,
    format: (v) => (typeof v === "number" ? `${(v * 100).toFixed(1)}%` : "-"),
  },
  sentence_structure_variety: {
    name: "Sentence Structure Variety",
    description: "Shannon entropy of POS tag sequences",
    tooltip: `Measures variety in sentence construction patterns.

Higher values indicate more diverse sentence structures.`,
    format: (v) => (typeof v === "number" ? v.toFixed(2) : "-"),
  },
  semantic_pacing_vectors: {
    name: "Semantic Pacing",
    description: "Cosine similarity between adjacent sentences",
    tooltip: `How connected adjacent sentences are (0 to 1).

• High (>0.75): Stalling - rephrasing previous sentence
• Low (<0.30): Whiplash - jumping topics too aggressively
• Flow state (0.40-0.65): Ideas connected but moving forward`,
    format: (v) =>
      Array.isArray(v)
        ? `avg: ${(v.reduce((a: number, b: number) => a + b, 0) / v.length).toFixed(2)}`
        : "-",
  },
  adverb_usage: {
    name: "Adverb Density",
    description: "Percentage of adverbs in text",
    tooltip: `Reliance on modifiers rather than strong verbs.

• Hemingway range: <3% - great fiction writers hover 3-5%
• Danger zone: >6% - "telling" instead of "showing"
  (e.g., "closed loudly" vs "slammed")

Philosophy may be higher (transcendentally, metaphysically) - check if replaceable with precise nouns.`,
    format: (v) => (typeof v === "number" ? `${v.toFixed(1)}%` : "-"),
  },
  sentiment_arc: {
    name: "Sentiment Arc",
    description: "Sentence-by-sentence sentiment scores",
    tooltip: `Tracks emotional tone throughout the text.

Positive values indicate positive sentiment, negative values indicate negative sentiment. Useful for seeing emotional progression.`,
    format: (v) =>
      Array.isArray(v)
        ? `avg: ${(v.reduce((a: number, b: number) => a + b, 0) / v.length).toFixed(2)}`
        : "-",
  },
  cognitive_load: {
    name: "Cognitive Load",
    description: "Average dependency tree depth",
    tooltip: `How many nested relationships the reader must hold in memory.

• Simple/Punchy (2.0-3.5): Action scenes, children's books
• Standard Adult (3.5-5.0): Clear non-fiction, standard novels
• Complex/Dense (>6.0): Legal, academic, Victorian literature
• Red flag (>8.0): Reader likely getting lost in clause structure`,
    format: (v) => (typeof v === "number" ? v.toFixed(2) : "-"),
  },
};

interface LexiStatus {
  available: boolean;
  baseUrl?: string;
  error?: string;
}

interface AnalysisResults {
  [key: string]: unknown;
}

export function useTextAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [lexiStatus, setLexiStatus] = useState<LexiStatus | null>(null);

  // Check Lexi status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/lexi-analyze");
        const data = await response.json();
        setLexiStatus(data);
      } catch {
        setLexiStatus({
          available: false,
          error: "Failed to check Lexi status",
        });
      }
    };

    checkStatus();
  }, []);

  /**
   * Analyze text with specified metrics
   */
  const analyze = useCallback(async (text: string, metrics: LexiMetric[]) => {
    if (!text.trim()) {
      setError("No text to analyze");
      return;
    }

    if (metrics.length === 0) {
      setError("No metrics selected");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/lexi-analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          metrics,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Analysis failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(extractErrorMessage(err));
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    results,
    lexiStatus,
    analyze,
    clearResults,
  };
}
