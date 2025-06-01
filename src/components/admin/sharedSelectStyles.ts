import type { StylesConfig } from "react-select";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly __isNew__?: boolean; // For creatable select
}

export const customReactSelectStyles: StylesConfig<SelectOption, boolean> = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "var(--color-background-admin, #FAF8F5)",
    borderColor: state.isFocused
      ? "var(--color-focus-admin, #93A191)"
      : "var(--color-border-admin-subtle, #EDEDED)",
    borderRadius: "var(--border-radius-admin, 3px)",
    minHeight: "auto",
    padding:
      "calc(var(--spacing-md-admin, 16px) - 6px) calc(var(--spacing-md-admin, 16px) - 1px)",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(163, 177, 161, 0.2)" : "none",
    transition: "border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
    "&:hover": {
      borderColor: state.isFocused
        ? "var(--color-focus-admin, #93A191)"
        : "var(--color-border-admin-subtle, #EDEDED)",
    },
    fontFamily: "var(--font-sans)",
    fontSize: "1rem",
  }),
  valueContainer: (provided) => ({
    ...provided,
    padding: "0px 4px",
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
    backgroundColor: "rgba(163, 177, 161, 0.15)",
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
      backgroundColor: "rgba(183, 86, 79, 0.1)",
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
    zIndex: 10,
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
        ? "rgba(163, 177, 161, 0.1)"
        : "transparent",
    color: state.isSelected
      ? "var(--color-background-admin, #FAF8F5)"
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
    display: "none",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "var(--color-text-admin-primary, #4A4A4A)",
    fontFamily: "var(--font-sans)",
  }),
};