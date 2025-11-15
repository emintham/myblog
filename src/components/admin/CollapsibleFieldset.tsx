import React, { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleFieldsetProps {
  legend: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
}

const CollapsibleFieldset: React.FC<CollapsibleFieldsetProps> = ({
  legend,
  children,
  defaultOpen = true,
  className = "",
  id,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <fieldset className={`collapsible-fieldset ${className}`} id={id}>
      <legend
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer", userSelect: "none" }}
        title={isOpen ? "Click to collapse" : "Click to expand"}
      >
        <span className="legend-content">
          {isOpen ? (
            <ChevronDown size={20} style={{ verticalAlign: "middle" }} />
          ) : (
            <ChevronRight size={20} style={{ verticalAlign: "middle" }} />
          )}
          <span style={{ marginLeft: "0.5rem" }}>{legend}</span>
        </span>
      </legend>
      <div
        className="fieldset-content"
        style={{
          display: isOpen ? "block" : "none",
        }}
      >
        {children}
      </div>
    </fieldset>
  );
};

export default CollapsibleFieldset;
