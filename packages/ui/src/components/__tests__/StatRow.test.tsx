import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatRow } from "../StatRow";

describe("StatRow", () => {
  it("renders label and value", () => {
    render(<StatRow label="COST" value="1,500" />);
    expect(screen.getByText("COST")).toBeDefined();
    expect(screen.getByText("1,500")).toBeDefined();
  });

  it("appends unit suffix when provided", () => {
    const { container } = render(<StatRow label="HULL" value={450} unit=" HP" />);
    expect(container.textContent).toContain("450 HP");
  });

  it("omits unit when not provided", () => {
    const { container } = render(<StatRow label="HULL" value={450} />);
    expect(container.textContent?.trim()).toBe("HULL450");
  });

  it("renders ReactNode value with inherited color", () => {
    render(
      <StatRow
        label="COST"
        value={<span data-testid="styled">1,500</span>}
        unit=" CR"
      />
    );
    expect(screen.getByTestId("styled")).toBeDefined();
    expect(screen.getByText("1,500")).toBeDefined();
  });

  it("merges className onto the root element", () => {
    const { container } = render(
      <StatRow label="COST" value="1,500" className="custom-row" />
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toBe("custom-row");
  });
});
