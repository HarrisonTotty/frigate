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

  it("displays ONLINE status by default", () => {
    render(<ModuleListHeader count={5} max={10} />);

    expect(screen.getByText("ONLINE")).toBeInTheDocument();
  });

  it("displays WARNING status when specified", () => {
    render(<ModuleListHeader count={9} max={10} status="warning" />);

    expect(screen.getByText("WARNING")).toBeInTheDocument();
  });

  it("displays CRITICAL status when specified", () => {
    render(<ModuleListHeader count={10} max={10} status="critical" />);

    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
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
    const { container } = render(
      <ModuleListHeader count={5} max={10} status="online" />
    );

    const header = container.querySelector("[role='region']");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute("aria-label", "Installed modules header");
  });

  it("has aria labels for status badge", () => {
    render(<ModuleListHeader count={5} max={10} status="online" />);

    const statusBadge = screen.getByLabelText("Status: ONLINE");
    expect(statusBadge).toBeInTheDocument();
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

  it("applies different status variants correctly", () => {
    const { rerender } = render(
      <ModuleListHeader count={5} max={10} status="online" />
    );
    expect(screen.getByText("ONLINE")).toBeInTheDocument();

    rerender(<ModuleListHeader count={5} max={10} status="warning" />);
    expect(screen.getByText("WARNING")).toBeInTheDocument();

    rerender(<ModuleListHeader count={5} max={10} status="critical" />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
  });

  it("renders ASCII top border", () => {
    const { container } = render(
      <ModuleListHeader count={5} max={10} />
    );

    const topBorder = container.querySelector(".top");
    expect(topBorder).toBeInTheDocument();
  });

  it("combines all elements correctly", () => {
    render(<ModuleListHeader count={9} max={12} status="warning" />);

    expect(screen.getByText("INSTALLED MODULES")).toBeInTheDocument();
    expect(screen.getByText("WARNING")).toBeInTheDocument();
    expect(screen.getByText("9/12")).toBeInTheDocument();
  });
});
