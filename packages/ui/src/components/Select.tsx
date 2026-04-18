import React, { useState, useRef, useEffect, useCallback } from "react";
import clsx from "clsx";

/**
 * Option type for the Select component
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Select Component
 *
 * Custom dropdown following hard sci-fi aesthetics.
 * No rounded corners, flat design, monospace typography.
 * Uses a custom dropdown list instead of native browser styling.
 */
export interface SelectProps {
  /** Unique identifier */
  id?: string;
  /** Currently selected value */
  value?: string;
  /** Change handler */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Full width select */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Children (option elements) */
  children?: React.ReactNode;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Accessible label for the select */
  "aria-label"?: string;
  /** ID of element describing this select */
  "aria-labelledby"?: string;
}

/**
 * Extract options from children (option elements), handling fragments recursively
 */
function extractOptions(children: React.ReactNode): SelectOption[] {
  const options: SelectOption[] = [];

  const collectOptions = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (React.isValidElement(child)) {
        // Handle React.Fragment - recursively extract children
        if (child.type === React.Fragment) {
          collectOptions(child.props.children);
        } else if (child.type === "option") {
          const props = child.props as React.OptionHTMLAttributes<HTMLOptionElement>;
          options.push({
            value: String(props.value ?? ""),
            label: String(props.children ?? ""),
            disabled: props.disabled,
          });
        }
      }
    });
  };

  collectOptions(children);
  return options;
}

export function Select({
  id,
  value,
  onChange,
  size = "md",
  fullWidth = false,
  disabled = false,
  children,
  className,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const options = extractOptions(children);
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label ?? options[0]?.label ?? "";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-option]");
      const item = items[highlightedIndex] as HTMLElement;
      if (item && typeof item.scrollIntoView === "function") {
        item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (onChange) {
        // Create a synthetic event to maintain compatibility with existing handlers
        const syntheticEvent = {
          target: { value: optionValue },
          currentTarget: { value: optionValue },
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
      setIsOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          if (isOpen && highlightedIndex >= 0) {
            const option = options[highlightedIndex];
            if (option && !option.disabled) {
              handleSelect(option.value);
            }
          } else {
            setIsOpen(true);
            setHighlightedIndex(options.findIndex((opt) => opt.value === value));
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(options.findIndex((opt) => opt.value === value));
          } else {
            setHighlightedIndex((prev) => {
              let next = prev + 1;
              while (next < options.length && options[next]?.disabled) {
                next++;
              }
              return next < options.length ? next : prev;
            });
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => {
              let next = prev - 1;
              while (next >= 0 && options[next]?.disabled) {
                next--;
              }
              return next >= 0 ? next : prev;
            });
          }
          break;
        case "Home":
          e.preventDefault();
          if (isOpen) {
            const firstEnabled = options.findIndex((opt) => !opt.disabled);
            if (firstEnabled >= 0) setHighlightedIndex(firstEnabled);
          }
          break;
        case "End":
          e.preventDefault();
          if (isOpen) {
            for (let i = options.length - 1; i >= 0; i--) {
              if (!options[i]?.disabled) {
                setHighlightedIndex(i);
                break;
              }
            }
          }
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, options, value, handleSelect]
  );

  const baseStyles: React.CSSProperties = {
    fontFamily: "var(--frigate-font-mono)",
    color: "var(--frigate-text-primary)",
    backgroundColor: "var(--frigate-bg-surface)",
    border: "1px solid var(--frigate-border-base)",
    borderRadius: 0,
    outline: "none",
    textTransform: "uppercase",
    width: fullWidth ? "100%" : undefined,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    transition: "border-color 50ms ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxSizing: "border-box",
  };

  const sizeStyles: React.CSSProperties = {
    sm: {
      padding: "var(--frigate-space-2) var(--frigate-space-3)",
      fontSize: "var(--frigate-font-small)",
    },
    md: {
      padding: "var(--frigate-space-3) var(--frigate-space-4)",
      fontSize: "var(--frigate-font-body)",
    },
    lg: {
      padding: "var(--frigate-space-4) var(--frigate-space-6)",
      fontSize: "var(--frigate-font-heading)",
    },
  }[size];

  const dropdownStyles: React.CSSProperties = {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "1px",
    backgroundColor: "var(--frigate-bg-surface)",
    border: "1px solid var(--frigate-border-base)",
    borderRadius: 0,
    maxHeight: "200px",
    overflowY: "auto",
    zIndex: 1000,
    boxSizing: "border-box",
  };

  const optionBaseStyles: React.CSSProperties = {
    fontFamily: "var(--frigate-font-mono)",
    fontSize: sizeStyles.fontSize,
    padding: sizeStyles.padding,
    cursor: "pointer",
    textTransform: "uppercase",
    color: "var(--frigate-text-primary)",
    backgroundColor: "transparent",
    transition: "background-color 50ms ease",
  };

  return (
    <div
      ref={containerRef}
      className={clsx("frigate-select", className)}
      style={{
        position: "relative",
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
    >
      <div
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        onFocus={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = "var(--frigate-primary)";
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = "var(--frigate-border-base)";
          }
        }}
        style={{ ...baseStyles, ...sizeStyles }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedLabel}
        </span>
        <span
          style={{
            marginLeft: "var(--frigate-space-2)",
            color: "var(--frigate-text-secondary)",
            flexShrink: 0,
          }}
        >
          {isOpen ? "[^]" : "[v]"}
        </span>
      </div>

      {isOpen && (
        <div ref={listRef} role="listbox" style={dropdownStyles}>
          {options.map((option, index) => {
            const isHighlighted = index === highlightedIndex;
            const isSelected = option.value === value;
            const isDisabled = option.disabled;

            return (
              <div
                key={option.value}
                data-option
                role="option"
                aria-selected={isSelected}
                aria-disabled={isDisabled}
                onClick={() => !isDisabled && handleSelect(option.value)}
                onMouseEnter={() => !isDisabled && setHighlightedIndex(index)}
                style={{
                  ...optionBaseStyles,
                  backgroundColor: isHighlighted
                    ? "var(--frigate-bg-raised)"
                    : isSelected
                      ? "var(--frigate-bg-raised)"
                      : "transparent",
                  color: isDisabled ? "var(--frigate-text-muted)" : "var(--frigate-text-primary)",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  borderLeft: isSelected
                    ? "2px solid var(--frigate-primary)"
                    : "2px solid transparent",
                }}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
