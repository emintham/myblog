import React from "react";
import CreatableSelect from "react-select/creatable";
import type { OnChangeValue, StylesConfig } from "react-select";

interface TagOption {
  readonly value: string;
  readonly label: string;
  readonly __isNew__?: boolean; // react-select uses this for creatable options
}

interface TagsComponentProps {
  id: string;
  label: string;
  value: string[]; // Current selected tags (array of strings)
  onChange: (newTags: string[]) => void; // Callback to update form state with array of strings
  suggestions?: string[]; // All available unique tags for suggestions
  placeholder?: string;
  // For react-hook-form Controller: name, onBlur, ref might be passed by field object
  // We will also pass onBlur from react-hook-form's field object if needed for validation.
  onBlur?: () => void;
}

// Kinfolk Inspired Minimalist Styles for react-select
const customStyles: StylesConfig<TagOption, true> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "var(--color-background-admin, #FAF8F5)",
    borderColor: state.isFocused
      ? "var(--color-focus-admin, #93A191)"
      : "var(--color-border-admin-subtle, #EDEDED)",
    borderRadius: "var(--border-radius-admin, 3px)",
    minHeight: "auto", // Allow padding to dictate height
    padding:
      "calc(var(--spacing-md-admin, 16px) - 6px) calc(var(--spacing-md-admin, 16px) - 1px)", // Approximate to match visual height of other inputs
    boxShadow: state.isFocused ? "0 0 0 2px rgba(163, 177, 161, 0.2)" : "none",
    transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      borderColor: state.isFocused
        ? "var(--color-focus-admin, #93A191)"
        : "var(--color-border-admin-subtle, #EDEDED)", // Keep focus color if focused
    },
    fontFamily: "var(--font-sans)", // Use global --font-sans (Montserrat)
    fontSize: "1rem",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0px 4px", // Reduced internal padding
    fontFamily: "var(--font-sans)",
  }),
  input: (provided) => ({
    ...provided,
    color: "var(--color-text-admin-primary, #4A4A4A)",
    margin: "0px",
    paddingTop: "0px",
    paddingBottom: "0px",
    fontFamily: "var(--font-sans)",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "var(--color-text-admin-secondary, #8C8C8C)",
    fontFamily: "var(--font-sans)",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "rgba(163, 177, 161, 0.15)", // Subtle accent background (using fixed values as accent-admin is greenish)
    borderRadius: "var(--border-radius-admin, 3px)",
    margin: "2px 4px 2px 0",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "var(--color-text-admin-primary, #4A4A4A)",
    padding: "var(--spacing-xs-admin, 4px) var(--spacing-sm-admin, 8px)",
    fontSize: "0.875rem",
    fontFamily: "var(--font-sans)",
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: "var(--color-text-admin-secondary, #8C8C8C)",
    borderRadius:
      "0 var(--border-radius-admin, 3px) var(--border-radius-admin, 3px) 0",
    "&:hover": {
      backgroundColor: "rgba(183, 86, 79, 0.1)", // Subtle error color bg
      color: "var(--color-error-admin, #B7564F)",
      cursor: "pointer",
    },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--color-background-admin, #FAF8F5)",
    borderRadius: "var(--border-radius-admin, 3px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginTop: "var(--spacing-sm-admin, 8px)",
    zIndex: 10, // Ensure menu is above other elements
    fontFamily: "var(--font-sans)",
  }),
  menuList: (provided) => ({
    ...provided,
    paddingTop: "var(--spacing-xs-admin, 4px)",
    paddingBottom: "var(--spacing-xs-admin, 4px)",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "var(--color-accent-admin, #A3B1A1)"
      : state.isFocused
        ? "rgba(163, 177, 161, 0.1)" // Subtle accent focus
        : "transparent",
    color: state.isSelected
      ? "var(--color-background-admin, #FAF8F5)" // Text color on selected option
      : "var(--color-text-admin-primary, #4A4A4A)",
    padding: "var(--spacing-sm-admin, 8px) var(--spacing-md-admin, 16px)",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontFamily: "var(--font-sans)",
    "&:active": {
      backgroundColor: state.isSelected
        ? "var(--color-accent-admin, #A3B1A1)"
        : "rgba(163, 177, 161, 0.2)",
    },
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    paddingRight: "var(--spacing-sm-admin, 8px)",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "var(--color-text-admin-secondary, #8C8C8C)",
    padding: "var(--spacing-sm-admin, 8px)",
    "&:hover": {
      color: "var(--color-text-admin-primary, #4A4A4A)",
    },
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "var(--color-text-admin-secondary, #8C8C8C)",
    padding: "var(--spacing-sm-admin, 8px)",
    "&:hover": {
      color: "var(--color-error-admin, #B7564F)",
    },
  }),
  indicatorSeparator: () => ({
    display: "none", // Hide the default separator
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "var(--color-text-admin-primary, #4A4A4A)",
    fontFamily: "var(--font-sans)",
  }),
};

const TagsComponent: React.FC<TagsComponentProps> = ({
  id,
  label,
  value, // array of strings
  onChange,
  suggestions = [],
  placeholder,
  onBlur, // Pass onBlur for react-hook-form
}) => {
  // Convert string suggestions to TagOption array
  const suggestionOptions: readonly TagOption[] = suggestions.map((s) => ({
    value: s.toLowerCase(),
    label: s,
  }));

  // Convert current string values to TagOption array
  // Ensure value is always an array, and handle potential undefined/null from RHF initial state
  const currentTagOptions: readonly TagOption[] = (
    Array.isArray(value) ? value : []
  ).map((v) => ({ value: v.toLowerCase(), label: v }));

  const handleChange = (newValue: OnChangeValue<TagOption, true>) => {
    // Extract only the string values for the form state
    const newStringValues = newValue
      ? newValue.map((option) => option.value)
      : [];
    onChange(newStringValues);
  };

  // Handle creation of new tags: use the input value directly
  const handleCreate = (inputValue: string) => {
    const newTagValue = inputValue.toLowerCase().trim();
    if (!newTagValue) return; // Don't create empty tags

    // Add the new tag to the existing values if it's not already there
    const newStringValues = [
      ...(Array.isArray(value) ? value : []),
      newTagValue,
    ]
      .map((v) => v.toLowerCase().trim()) // normalize all
      .filter((v, index, self) => self.indexOf(v) === index); // ensure uniqueness

    onChange(newStringValues);
  };

  return (
    <div className="form-field tags-component-field">
      <label htmlFor={id} className="tags-component-label">
        {label}
      </label>
      <CreatableSelect
        inputId={id}
        instanceId={id} // Add this line
        isMulti
        options={suggestionOptions}
        value={currentTagOptions}
        onChange={handleChange}
        onCreateOption={handleCreate} // Handle new tag creation
        placeholder={placeholder || "Type or select tags..."}
        styles={customStyles} // Apply custom styles
        onBlur={onBlur} // Connect onBlur for RHF
        formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
        // Delimiters like comma, enter, tab can be handled by react-select's default behavior
        // or by adding specific keydown handlers if more control is needed.
        // For now, Enter on input or selecting an option (including "Create new...") will add a tag.
      />
    </div>
  );
};

export default TagsComponent;
