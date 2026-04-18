import React from "react";

export interface ModuleSlotCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function ModuleSlotCategoryTabs({
  categories,
  selectedCategory,
  onSelect,
}: ModuleSlotCategoryTabsProps) {
  return (
    <div
      className="frigate-technical-text"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--frigate-space-1)",
        fontFamily: "var(--frigate-font-mono)",
        background: "var(--frigate-bg-surface)",
        borderRadius: "var(--frigate-radius-none)",
        boxShadow: "none",
        padding: "var(--frigate-space-1) 0",
        overflow: "hidden",
        maxWidth: "100%",
      }}
      role="tablist"
      aria-label="Module Slot Categories"
    >
      {categories.map((cat) => (
        <button
          key={cat}
          style={{
            background: selectedCategory === cat ? "var(--frigate-primary)" : "none",
            color:
              selectedCategory === cat
                ? "var(--frigate-text-inverse)"
                : "var(--frigate-text-secondary)",
            fontWeight: 700,
            border: "none",
            borderBottom:
              selectedCategory === cat
                ? "2px solid var(--frigate-primary)"
                : "2px solid var(--frigate-border-base)",
            borderRadius: "var(--frigate-radius-none)",
            padding: "var(--frigate-space-2) var(--frigate-space-3)",
            cursor: "pointer",
            fontFamily: "inherit",
            outline: "none",
            textTransform: "uppercase",
            letterSpacing: 1,
            whiteSpace: "nowrap",
          }}
          role="tab"
          aria-selected={selectedCategory === cat}
          tabIndex={selectedCategory === cat ? 0 : -1}
          onClick={() => onSelect(cat)}
        >
          [{cat}]
        </button>
      ))}
    </div>
  );
}

export default ModuleSlotCategoryTabs;
