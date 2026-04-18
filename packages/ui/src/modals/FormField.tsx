import React from "react";
import { BOX_DRAWING } from "../constants";

export interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "number" | "email" | "password";
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  error,
  disabled = false,
  autoComplete,
}: FormFieldProps) {
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
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        style={{
          fontFamily: "var(--frigate-font-mono)",
          fontSize: "var(--frigate-font-body)",
          padding: "var(--frigate-space-3)",
          backgroundColor: "var(--frigate-bg-secondary)",
          color: "var(--frigate-text-primary)",
          border: `1px solid ${error ? "var(--frigate-danger)" : "var(--frigate-border-light)"}`,
          borderRadius: 0,
          outline: "none",
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
      />
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
