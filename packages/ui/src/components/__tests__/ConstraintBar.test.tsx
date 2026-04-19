import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConstraintBar } from "../ConstraintBar";

describe("ConstraintBar", () => {
  it("renders label when provided", () => {
    render(<ConstraintBar label="WEIGHT" current={50} max={100} />);
    expect(screen.getByText("WEIGHT")).toBeDefined();
  });

  it("omits label element when label is undefined", () => {
    const { container } = render(<ConstraintBar current={50} max={100} />);
    // The header row is the first child; when no label is supplied it should
    // contain only the readout span.
    const headerRow = container.firstChild?.firstChild as HTMLElement;
    expect(headerRow.children.length).toBe(1);
  });

  it("renders current/max readout with unit", () => {
    render(<ConstraintBar label="WEIGHT" current={50} max={100} unit=" t" />);
    expect(screen.getByText("50/100 t")).toBeDefined();
  });

  it("uses formatValue to format the readout", () => {
    render(
      <ConstraintBar
        label="CREDITS"
        current={1500}
        max={10000}
        unit=" CR"
        formatValue={(n) => n.toLocaleString()}
      />
    );
    expect(screen.getByText("1,500/10,000 CR")).toBeDefined();
  });

  it("appends over-limit indicator when exceeded and showOverLimit is true", () => {
    render(
      <ConstraintBar
        label="WEIGHT"
        current={120}
        max={100}
        unit=" t"
        showOverLimit
      />
    );
    expect(screen.getByText("120/100 t [!]")).toBeDefined();
  });

  it("does not append over-limit indicator when showOverLimit is false", () => {
    render(<ConstraintBar label="WEIGHT" current={120} max={100} unit=" t" />);
    expect(screen.queryByText("120/100 t [!]")).toBeNull();
    expect(screen.getByText("120/100 t")).toBeDefined();
  });

  it("renders em dash when max is zero", () => {
    render(<ConstraintBar label="WEIGHT" current={50} max={0} unit=" t" />);
    expect(screen.getByText("50/— t")).toBeDefined();
  });
});
