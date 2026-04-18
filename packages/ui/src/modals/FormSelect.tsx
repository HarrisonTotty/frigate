import React from "react";
import { BOX_DRAWING } from "../constants";

export interface FormSelectProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
  disabled = false,
}: FormSelectProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--frigate-space-2)",
      }}
    >
      <label
        htmlFor={name}
        style={{
          fontSize: "var(--frigate-font-small)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: error ? "var(--frigate-danger)" : "var(--frigate-text-secondary)",
          fontFamily: "var(--frigate-font-mono)",
        }}
      >
        {label}
        {required && <span style={{ color: "var(--frigate-danger)" }}> *</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        style={{
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-body)",
          padding: "var(--frigate-space-3)",
          backgroundColor: "var(--frigate-bg-secondary)",
          color: "var(--frigate-text-primary)",
          border: `1px solid ${error ? "var(--frigate-danger)" : "var(--frigate-border-light)"}`,
          borderRadius: 0,
          outline: "none",
          cursor: "pointer",
          transition: "border-color 50ms ease",
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = "var(--frigate-primary)";
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = "var(--frigate-border-light)";
          }
        }}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span
          style={{
            fontSize: "var(--frigate-font-small)",
            color: "var(--frigate-danger)",
            fontFamily: "var(--frigate-font-mono)",
          }}
        >
          {BOX_DRAWING.T_RIGHT} {error}
        </span>
      )}
    </div>
  );
}
