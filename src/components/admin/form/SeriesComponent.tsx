import React from "react";
import CreatableSelect from "react-select/creatable"; // Use CreatableSelect
import type { OnChangeValue } from "react-select";
import {
  customReactSelectStyles,
  type SelectOption,
} from "../sharedSelectStyles";

interface SeriesComponentProps {
  id: string;
  label: string;
  value: string | null | undefined;
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
    value: s,
    label: s,
  }));

  const currentSeriesOption: SelectOption | null = value
    ? suggestionOptions.find((option) => option.value === value) || {
        value,
        label: value,
      }
    : null;

  const handleChange = (newValue: OnChangeValue<SelectOption, false>) => {
    onChange(newValue ? newValue.value : null);
  };

  // Handle creation of a new series
  const handleCreate = (inputValue: string) => {
    const newSeriesValue = inputValue.trim();
    if (!newSeriesValue) return;
    onChange(newSeriesValue);
  };

  return (
    <div className="form-field series-component-field">
      <label htmlFor={id} className="series-component-label">
        {label}
      </label>
      <CreatableSelect // Use CreatableSelect component
        inputId={id}
        instanceId={id}
        options={suggestionOptions}
        value={currentSeriesOption}
        onChange={handleChange}
        onCreateOption={handleCreate} // Add onCreateOption handler
        placeholder={placeholder || "Select or create a series..."}
        styles={customReactSelectStyles}
        onBlur={onBlur}
        isClearable
        formatCreateLabel={(inputValue) => `Create "${inputValue}"`} // Customize create label
      />
    </div>
  );
};

export default SeriesComponent;
