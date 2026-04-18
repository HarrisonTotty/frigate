import React from "react";
import clsx from "clsx";

/**
 * Accordion Component
 *
 * Expandable/collapsible content sections.
 */
export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple panels open at once */
  multiple?: boolean;
  /** Initially expanded item IDs */
  defaultExpanded?: string[];
  className?: string;
}

export function Accordion({
  items,
  multiple = false,
  defaultExpanded = [],
  className,
}: AccordionProps) {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(defaultExpanded));

  const toggleItem = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={clsx("frigate-accordion", className)}>
      {items.map((item) => {
        const isExpanded = expanded.has(item.id);
        return (
          <div
            key={item.id}
            className="frigate-accordion-item"
            style={{
              borderBottom: "1px solid var(--frigate-border-base)",
            }}
          >
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              aria-expanded={isExpanded}
              aria-disabled={item.disabled}
              style={{
                width: "100%",
                padding: "var(--frigate-space-3) var(--frigate-space-4)",
                backgroundColor: isExpanded ? "var(--frigate-bg-raised)" : "transparent",
                border: "none",
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: item.disabled ? "not-allowed" : "pointer",
                transition: "background-color var(--frigate-transition-fast)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-body)",
                color: item.disabled ? "var(--frigate-text-muted)" : "var(--frigate-text-primary)",
                opacity: item.disabled ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!item.disabled && !isExpanded) {
                  e.currentTarget.style.backgroundColor = "var(--frigate-bg-surface)";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled && !isExpanded) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span style={{ fontWeight: 500 }}>{item.title}</span>
              <span
                style={{
                  transition: "transform var(--frigate-transition-fast)",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </span>
            </button>
            {isExpanded && (
              <div
                style={{
                  padding: "var(--frigate-space-4)",
                  backgroundColor: "var(--frigate-bg-surface)",
                  animation: "frigate-slide-down var(--frigate-transition-fast)",
                }}
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
