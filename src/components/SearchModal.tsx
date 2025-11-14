// src/components/SearchModal.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Fuse from "fuse.js";
import type { SearchablePost } from "../utils/searchUtils";
import { Search, X } from "lucide-react";
import "../styles/search.css";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchablePost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fuse, setFuse] = useState<Fuse<SearchablePost> | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Load search data and initialize Fuse
  useEffect(() => {
    if (isOpen && !fuse) {
      setIsLoading(true);
      fetch("/search-data.json")
        .then((res) => res.json())
        .then((data: SearchablePost[]) => {
          const fuseInstance = new Fuse(data, {
            keys: [
              { name: "title", weight: 2 },
              { name: "description", weight: 1.5 },
              { name: "tags", weight: 1.2 },
              { name: "content", weight: 0.8 },
              { name: "series", weight: 1 },
            ],
            threshold: 0.4,
            includeScore: true,
            minMatchCharLength: 2,
          });
          setFuse(fuseInstance);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load search data:", error);
          setIsLoading(false);
        });
    }
  }, [isOpen, fuse]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Perform search
  useEffect(() => {
    if (!fuse || !query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchResults = fuse.search(query);
    const posts = searchResults.map((result) => result.item).slice(0, 10);
    setResults(posts);
    setSelectedIndex(0);
  }, [query, fuse]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            window.location.href = results[selectedIndex].url;
          }
          break;
      }
    },
    [isOpen, onClose, results, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const getPostTypeLabel = (postType: string) => {
    switch (postType) {
      case "fleeting":
        return "Fleeting";
      case "bookNote":
        return "Book Note";
      default:
        return "Post";
    }
  };

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search posts by title, content, or tags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search posts"
          />
          <button
            className="search-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <X size={20} />
          </button>
        </div>

        <div className="search-results" ref={resultsRef}>
          {isLoading && (
            <div className="search-loading">Loading search index...</div>
          )}

          {!isLoading && query && results.length === 0 && (
            <div className="search-empty">No results found for "{query}"</div>
          )}

          {!isLoading && !query && (
            <div className="search-hint">
              Start typing to search posts, tags, and content
            </div>
          )}

          {!isLoading &&
            results.map((post, index) => (
              <a
                key={post.slug}
                href={post.url}
                className={`search-result-item ${
                  index === selectedIndex ? "selected" : ""
                }`}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="search-result-header">
                  <span className="search-result-title">{post.title}</span>
                  <span className="search-result-type">
                    {getPostTypeLabel(post.postType)}
                  </span>
                </div>
                {post.description && (
                  <div className="search-result-description">
                    {post.description}
                  </div>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="search-result-tags">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="search-result-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
        </div>

        <div className="search-footer">
          <kbd>↑↓</kbd> Navigate <kbd>Enter</kbd> Select <kbd>Esc</kbd> Close
        </div>
      </div>
    </div>
  );
}
