/**
 * Reusable collapsible section component
 * Used in Content Intelligence Dashboard and other admin interfaces
 */

import { useState, useEffect, type ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  badge?: number | string;
  defaultExpanded?: boolean;
  children: ReactNode;
  className?: string;
  onExpandedChange?: (isExpanded: boolean) => void;
}

export default function CollapsibleSection({
  title,
  badge,
  defaultExpanded = false,
  children,
  className = "",
  onExpandedChange,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (onExpandedChange) {
      onExpandedChange(isExpanded);
    }
  }, [isExpanded, onExpandedChange]);

  return (
    <div className={`collapsible-section ${className}`}>
      <button
        className="section-header"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${title}`}
      >
        <h2>
          {title}
          {badge !== undefined && (
            <span className="section-badge">({badge})</span>
          )}
        </h2>
        <span className="toggle-icon" aria-hidden="true">
          {isExpanded ? "−" : "+"}
        </span>
      </button>
      {isExpanded && <div className="section-content">{children}</div>}
    </div>
  );
}
