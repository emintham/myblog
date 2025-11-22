/**
 * Text Analysis Panel
 * Collapsible sidebar for Lexi text analysis
 */

import React, { useState } from "react";
import {
  useTextAnalysis,
  LEXI_METRICS,
  METRIC_INFO,
  type LexiMetric,
} from "../../../hooks/useTextAnalysis";
import { ChevronRight, BarChart2, AlertCircle, Info } from "lucide-react";

interface TextAnalysisPanelProps {
  position?: "left" | "right";
}

export const TextAnalysisPanel: React.FC<TextAnalysisPanelProps> = ({
  position = "left",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState<LexiMetric[]>([
    "vocabulary_diversity",
    "adverb_usage",
    "cognitive_load",
  ]);

  const { isLoading, error, results, lexiStatus, analyze, clearResults } =
    useTextAnalysis();

  // Get text from the editor (CodeMirror)
  const getEditorText = (): string => {
    // CodeMirror stores content in .cm-content element
    const cmContent = document.querySelector(".cm-content");
    if (cmContent) {
      const text = cmContent.textContent || "";
      console.log(
        "[TextAnalysis] Found CodeMirror content, length:",
        text.length
      );
      return text;
    }

    // Fallback to textarea
    const textarea = document.querySelector(
      '[name="bodyContent"], #bodyContent'
    ) as HTMLTextAreaElement;
    console.log("[TextAnalysis] Fallback textarea:", textarea?.value?.length);
    return textarea?.value || "";
  };

  const handleAnalyze = () => {
    const text = getEditorText();
    console.log(
      "[TextAnalysis] Text to analyze:",
      text.substring(0, 100) + "..."
    );
    console.log("[TextAnalysis] Text length:", text.length);
    analyze(text, selectedMetrics);
  };

  const toggleMetric = (metric: LexiMetric) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
    );
  };

  return (
    <div
      className={`text-analysis-panel ${isCollapsed ? "collapsed" : ""} position-${position}`}
    >
      <div className="text-analysis-header">
        <button
          type="button"
          className="collapse-button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={
            isCollapsed ? "Expand Text Analysis" : "Collapse Text Analysis"
          }
        >
          {isCollapsed ? (
            <span className="collapse-indicator">
              {position === "left" ? "»" : "«"}
            </span>
          ) : (
            <>
              <BarChart2 size={16} />
              <span>Text Analysis</span>
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <div className="text-analysis-content">
          {/* Lexi Status */}
          {lexiStatus && !lexiStatus.available && (
            <div className="text-analysis-error">
              <AlertCircle size={16} />
              <div>
                <strong>Lexi not available</strong>
                <p>{lexiStatus.error}</p>
                <p className="text-analysis-help">
                  Ensure Lexi is running on port 8000.
                </p>
              </div>
            </div>
          )}

          {/* Metric Selection */}
          {lexiStatus?.available && (
            <>
              <div className="metric-selection">
                <label>Select Metrics:</label>
                <div className="metric-checkboxes">
                  {LEXI_METRICS.map((metric) => (
                    <label key={metric} className="metric-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.includes(metric)}
                        onChange={() => toggleMetric(metric)}
                      />
                      <span title={METRIC_INFO[metric].description}>
                        {METRIC_INFO[metric].name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="text-analysis-actions">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="analyze-button"
                  disabled={isLoading || selectedMetrics.length === 0}
                >
                  {isLoading ? "Analyzing..." : "Analyze Text"}
                </button>
                {results && (
                  <button
                    type="button"
                    onClick={clearResults}
                    className="clear-button"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="text-analysis-error">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Results */}
              {results && (
                <div className="analysis-results">
                  <h4>Results</h4>
                  {Object.entries(results).map(([key, value]) => {
                    const metric = key as LexiMetric;
                    const info = METRIC_INFO[metric];
                    if (!info) return null;

                    return (
                      <div key={key} className="result-item">
                        <div className="result-label">
                          <span>{info.name}</span>
                          <span
                            className="result-tooltip-trigger"
                            title={info.tooltip}
                          >
                            <Info size={12} />
                          </span>
                        </div>
                        <div className="result-value">{info.format(value)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
