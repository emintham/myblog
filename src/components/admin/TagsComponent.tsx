import React from 'react';
import CreatableSelect from 'react-select/creatable';
import type { OnChangeValue, StylesConfig } from 'react-select';

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

// Basic styling to make it fit in better with existing form fields.
// You can expand on this or use global CSS.
const customStyles: StylesConfig<TagOption, true> = {
  control: (provided) => ({
    ...provided,
    borderColor: 'var(--form-input-border-color, #ccc)', // Example using CSS variables if you have them
    '&:hover': {
      borderColor: 'var(--form-input-border-color-hover, #aaa)',
    },
    backgroundColor: 'var(--form-input-bg, white)',
    minHeight: '38px', // Match typical input height
    boxShadow: 'none', // Remove default react-select shadow if desired
  }),
  input: (provided) => ({
    ...provided,
    color: 'var(--form-input-text-color, #333)',
    margin: '0px', // Reset margin
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: '2px 8px', // Adjust padding
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: 'var(--tag-bg-color, #e0e0e0)',
    borderRadius: 'var(--tag-border-radius, 4px)',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: 'var(--tag-text-color, #333)',
    padding: '3px 6px',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    '&:hover': {
      backgroundColor: 'var(--tag-remove-hover-bg, #c0c0c0)',
      color: 'var(--tag-remove-hover-color, white)',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--form-input-placeholder-color, #888)',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--dropdown-bg, white)',
    zIndex: 2 // Ensure dropdown is above other elements
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'var(--dropdown-selected-bg, #007bff)' : state.isFocused ? 'var(--dropdown-hover-bg, #f0f0f0)' : 'var(--dropdown-bg, white)',
    color: state.isSelected ? 'var(--dropdown-selected-text, white)' : 'var(--dropdown-text, #333)',
    '&:active': {
      backgroundColor: state.isSelected ? 'var(--dropdown-selected-bg, #007bff)' : 'var(--dropdown-active-bg, #e0e0e0)',
    }
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
  const suggestionOptions: readonly TagOption[] = suggestions.map(s => ({ value: s.toLowerCase(), label: s }));

  // Convert current string values to TagOption array
  // Ensure value is always an array, and handle potential undefined/null from RHF initial state
  const currentTagOptions: readonly TagOption[] = (Array.isArray(value) ? value : [])
    .map(v => ({ value: v.toLowerCase(), label: v }));


  const handleChange = (newValue: OnChangeValue<TagOption, true>) => {
    // Extract only the string values for the form state
    const newStringValues = newValue ? newValue.map(option => option.value) : [];
    onChange(newStringValues);
  };

  // Handle creation of new tags: use the input value directly
  const handleCreate = (inputValue: string) => {
    const newTagValue = inputValue.toLowerCase().trim();
    if (!newTagValue) return; // Don't create empty tags

    // Add the new tag to the existing values if it's not already there
    const newStringValues = [...(Array.isArray(value) ? value : []), newTagValue]
        .map(v => v.toLowerCase().trim()) // normalize all
        .filter((v, index, self) => self.indexOf(v) === index); // ensure uniqueness

    onChange(newStringValues);
  };


  return (
    <div className="form-field tags-component-field">
      <label htmlFor={id} className="tags-component-label">{label}</label>
      <CreatableSelect
        inputId={id}
        isMulti
        options={suggestionOptions}
        value={currentTagOptions}
        onChange={handleChange}
        onCreateOption={handleCreate} // Handle new tag creation
        placeholder={placeholder || 'Type or select tags...'}
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