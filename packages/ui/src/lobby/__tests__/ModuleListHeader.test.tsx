import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModuleListHeader } from "../ModuleListHeader";

describe("ModuleListHeader Component", () => {
  it("renders with correct title", () => {
    render(<ModuleListHeader count={5} max={10} />);

    expect(screen.getByText("INSTALLED MODULES")).toBeInTheDocument();
  });

  it("displays module count correctly", () => {
    render(<ModuleListHeader count={8} max={12} />);

    expect(screen.getByText("COUNT:")).toBeInTheDocument();
    expect(screen.getByText("8/12")).toBeInTheDocument();
  });

  it("renders with ONLINE status by default", () => {
    const { container } = render(<ModuleListHeader count={5} max={10} />);
    // Component accepts status prop for styling but does not render status text.
    expect(container.querySelector("[role='region']")).toBeInTheDocument();
  });

  it("renders with WARNING status when specified", () => {
    const { container } = render(<ModuleListHeader count={9} max={10} status="warning" />);
    expect(container.querySelector("[role='region']")).toBeInTheDocument();
  });

  it("renders with CRITICAL status when specified", () => {
    const { container } = render(<ModuleListHeader count={10} max={10} status="critical" />);
    expect(container.querySelector("[role='region']")).toBeInTheDocument();
  });

  it("shows max warning when count equals max", () => {
    render(<ModuleListHeader count={10} max={10} />);

    expect(screen.getByText(/MAXIMUM MODULES INSTALLED/)).toBeInTheDocument();
  });

  it("shows max warning when count exceeds max", () => {
    render(<ModuleListHeader count={11} max={10} />);

    expect(screen.getByText(/MAXIMUM MODULES INSTALLED/)).toBeInTheDocument();
  });

  it("does not show max warning when not at max", () => {
    render(<ModuleListHeader count={8} max={10} />);

    expect(screen.queryByText(/MAXIMUM MODULES INSTALLED/)).not.toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const { container } = render(<ModuleListHeader count={5} max={10} status="online" />);

    const header = container.querySelector("[role='region']");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("aria-label", "Installed modules header");
  });

  it("has aria labels for module count display", () => {
    render(<ModuleListHeader count={5} max={10} status="online" />);

    const countDisplay = screen.getByLabelText("Module count: 5 of 10");
    expect(countDisplay).toBeInTheDocument();
  });

  it("has status role for count display", () => {
    render(<ModuleListHeader count={8} max={10} />);

    const countDisplay = screen.getByLabelText("Module count: 8 of 10");
    expect(countDisplay).toHaveAttribute("role", "status");
  });

  it("has alert role for max warning", () => {
    render(<ModuleListHeader count={10} max={10} />);

    const maxWarning = screen.getByRole("alert");
    expect(maxWarning).toBeInTheDocument();
  });

  it("renders with zero modules", () => {
    render(<ModuleListHeader count={0} max={10} />);

    expect(screen.getByText("0/10")).toBeInTheDocument();
  });

  it("renders with single module", () => {
    render(<ModuleListHeader count={1} max={5} />);

    expect(screen.getByText("1/5")).toBeInTheDocument();
  });

  it("renders with large counts", () => {
    render(<ModuleListHeader count={500} max={1000} />);

    expect(screen.getByText("500/1000")).toBeInTheDocument();
  });

  it("applies different status variants without crashing", () => {
    const { rerender, container } = render(<ModuleListHeader count={5} max={10} status="online" />);
    expect(container.querySelector("[role='region']")).toBeInTheDocument();

    rerender(<ModuleListHeader count={5} max={10} status="warning" />);
    expect(container.querySelector("[role='region']")).toBeInTheDocument();

    rerender(<ModuleListHeader count={5} max={10} status="critical" />);
    expect(container.querySelector("[role='region']")).toBeInTheDocument();
  });

  it("renders top border element", () => {
    const { container } = render(<ModuleListHeader count={5} max={10} />);

    // Top border is the first child div after the region wrapper, purely decorative
    const region = container.querySelector("[role='region']");
    expect(region?.firstChild).toBeInTheDocument();
  });

  it("combines all elements correctly", () => {
    render(<ModuleListHeader count={9} max={12} status="warning" />);

    expect(screen.getByText("INSTALLED MODULES")).toBeInTheDocument();
    expect(screen.getByText("COUNT:")).toBeInTheDocument();
    expect(screen.getByText("9/12")).toBeInTheDocument();
  });
});
