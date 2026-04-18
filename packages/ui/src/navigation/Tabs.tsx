import React from "react";
import clsx from "clsx";

/**
 * Tabs Component
 *
 * Tabbed navigation for switching between different views or content sections.
 */
export interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={clsx("frigate-tabs", className)} role="tablist">
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--frigate-border-base)",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              style={{
                padding: "var(--frigate-space-3) var(--frigate-space-4)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isActive
                  ? "2px solid var(--frigate-primary)"
                  : "2px solid transparent",
                color: isActive
                  ? "var(--frigate-primary)"
                  : tab.disabled
                    ? "var(--frigate-text-muted)"
                    : "var(--frigate-text-secondary)",
                fontFamily: "var(--frigate-font-mono)",
                fontSize: "var(--frigate-font-body)",
                fontWeight: isActive ? 600 : 400,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                cursor: tab.disabled ? "not-allowed" : "pointer",
                transition: "all var(--frigate-transition-fast)",
                opacity: tab.disabled ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!tab.disabled && !isActive) {
                  e.currentTarget.style.color = "var(--frigate-text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!tab.disabled && !isActive) {
                  e.currentTarget.style.color = "var(--frigate-text-secondary)";
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
