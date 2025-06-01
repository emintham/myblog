import React from "react";
import Select from "react-select";
import type { OnChangeValue } from "react-select";
import { customReactSelectStyles, type SelectOption } from "./sharedSelectStyles";

interface SeriesComponentProps {
  id: string;
  label: string;
  value: string | null | undefined; // Series is a single string or null/undefined
  onChange: (newSeries: string | null) => void;
  suggestions?: string[];
  placeholder?: string;
  onBlur?: () => void;
}

const SeriesComponent: React.FC<SeriesComponentProps> = ({
  id,
  label,
  value,
  onChange,
  suggestions = [],
  placeholder,
  onBlur,
}) => {
  const suggestionOptions: readonly SelectOption[] = suggestions.map((s) => ({
    value: s, // Keep original casing for series display if desired, or .toLowerCase()
    label: s,
  }));

  // Find the SelectOption that matches the current string value
  const currentSeriesOption: SelectOption | null = value
    ? suggestionOptions.find((option) => option.value === value) || { value, label: value } // Fallback if not in suggestions
    : null;

  const handleChange = (newValue: OnChangeValue<SelectOption, false>) => {
    onChange(newValue ? newValue.value : null);
  };

  return (
    <div className="form-field series-component-field">
      <label htmlFor={id} className="series-component-label">
        {label}
      </label>
      <Select
        inputId={id}
        instanceId={id}
        options={suggestionOptions}
        value={currentSeriesOption}
        onChange={handleChange}
        placeholder={placeholder || "Select or type a series..."}
        styles={customReactSelectStyles}
        onBlur={onBlur}
        isClearable // Allow clearing the series
      />
    </div>
  );
};

export default SeriesComponent;