// src/components/SearchButton.tsx
import React, { useState, useEffect } from "react";
import SearchModal from "./SearchModal";
import { Search } from "lucide-react";

export default function SearchButton() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        className="search-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Open search"
      >
        <Search size={16} />
        <span>Search</span>
        <kbd>{navigator.platform.includes("Mac") ? "⌘" : "Ctrl"}K</kbd>
      </button>
      <SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
