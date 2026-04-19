import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PanelFooter } from "../PanelFooter";

describe("PanelFooter", () => {
  it("renders NOMINAL status when warningCount is 0", () => {
    render(<PanelFooter warningCount={0} />);
    expect(screen.getByText("[STATUS: NOMINAL]")).toBeDefined();
    expect(screen.queryByText(/ISSUE/)).toBeNull();
  });

  it("renders WARNING status with pluralized issue count", () => {
    render(<PanelFooter warningCount={3} />);
    expect(screen.getByText("[STATUS: WARNING]")).toBeDefined();
    expect(screen.getByText("[3 ISSUES]")).toBeDefined();
  });

  it("renders singular ISSUE label when warningCount is 1", () => {
    render(<PanelFooter warningCount={1} />);
    expect(screen.getByText("[1 ISSUE]")).toBeDefined();
  });

  it("renders children verbatim when provided", () => {
    render(
      <PanelFooter>
        <span>FREE-FORM CONTENT</span>
      </PanelFooter>
    );
    expect(screen.getByText("FREE-FORM CONTENT")).toBeDefined();
  });

  it("prefers children over warningCount rendering", () => {
    render(
      <PanelFooter warningCount={5}>
        <span>OVERRIDE</span>
      </PanelFooter>
    );
    expect(screen.getByText("OVERRIDE")).toBeDefined();
    expect(screen.queryByText("[STATUS: WARNING]")).toBeNull();
  });

  it("renders an empty footer when neither children nor warningCount provided", () => {
    const { container } = render(<PanelFooter />);
    const footer = container.firstChild as HTMLElement;
    expect(footer.textContent).toBe("");
  });

  it("applies custom className to root", () => {
    const { container } = render(<PanelFooter warningCount={0} className="my-footer" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toBe("my-footer");
  });
});
