import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PanelHeader } from "../PanelHeader";

describe("PanelHeader", () => {
  it("renders the title", () => {
    render(<PanelHeader title="CARGO STATUS" />);
    expect(screen.getByText("CARGO STATUS")).toBeDefined();
  });

  it("renders explicit subtitle when provided", () => {
    render(<PanelHeader title="CARGO STATUS" subtitle="RESOURCE ALLOCATION" />);
    expect(screen.getByText("RESOURCE ALLOCATION")).toBeDefined();
  });

  it("renders item count subtitle with pluralized noun", () => {
    render(<PanelHeader title="LOADED INVENTORY" itemCount={3} />);
    expect(screen.getByText("3 ITEMS LOADED")).toBeDefined();
  });

  it("renders singular noun when itemCount is 1", () => {
    render(<PanelHeader title="LOADED INVENTORY" itemCount={1} />);
    expect(screen.getByText("1 ITEM LOADED")).toBeDefined();
  });

  it("renders plural noun when itemCount is 0", () => {
    render(<PanelHeader title="LOADED INVENTORY" itemCount={0} />);
    expect(screen.getByText("0 ITEMS LOADED")).toBeDefined();
  });

  it("prefers explicit subtitle over itemCount", () => {
    render(<PanelHeader title="X" subtitle="CUSTOM" itemCount={5} />);
    expect(screen.getByText("CUSTOM")).toBeDefined();
    expect(screen.queryByText("5 ITEMS LOADED")).toBeNull();
  });

  it("does not render subtitle slot when neither subtitle nor itemCount is provided", () => {
    const { container } = render(<PanelHeader title="BARE" />);
    // Only the title node should be inside the title wrapper
    const titleWrapper = container.firstChild?.firstChild as HTMLElement;
    expect(titleWrapper.children.length).toBe(1);
  });

  it("renders actions slot when provided", () => {
    render(
      <PanelHeader title="CARGO STATUS" actions={<button type="button">GO</button>} />
    );
    expect(screen.getByRole("button", { name: "GO" })).toBeDefined();
  });

  it("respects custom itemLabel", () => {
    render(<PanelHeader title="CARGO" itemCount={2} itemLabel="CRATE" />);
    expect(screen.getByText("2 CRATES LOADED")).toBeDefined();
  });

  it("applies custom className to root", () => {
    const { container } = render(<PanelHeader title="X" className="my-header" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toBe("my-header");
  });
});
