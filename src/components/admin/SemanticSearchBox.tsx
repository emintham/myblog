import React, { useState } from "react";

interface SemanticSearchBoxProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const EXAMPLE_QUERIES = [
  "content about habits and productivity",
  "ideas related to learning and growth",
  "quotes about creativity",
  "posts discussing systems thinking",
];

export default function SemanticSearchBox({
  onSearch,
  isLoading,
}: SemanticSearchBoxProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };

  return (
    <div className="semantic-search-box">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all posts and quotes..."
            className="search-input"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="search-button"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      <div className="search-examples">
        <span className="examples-label">Try:</span>
        {EXAMPLE_QUERIES.map((example, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleExampleClick(example)}
            className="example-button"
            disabled={isLoading}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
