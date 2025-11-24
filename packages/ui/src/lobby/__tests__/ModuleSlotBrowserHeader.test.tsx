import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModuleSlotBrowserHeader } from "../ModuleSlotBrowserHeader";

describe("ModuleSlotBrowserHeader Component", () => {
  it("renders with correct title", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={100} buildPointsMax={250} />
    );

    expect(screen.getByText("MODULE SLOT BROWSER")).toBeInTheDocument();
  });

  it("displays build points correctly", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={180} buildPointsMax={250} />
    );

    expect(screen.getByText("BUILD POINTS:")).toBeInTheDocument();
    expect(screen.getByText("180/250")).toBeInTheDocument();
  });

  it("calculates percentage correctly for low usage", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={50} buildPointsMax={250} />
    );

    expect(screen.getByText("20.0%")).toBeInTheDocument();
  });

  it("calculates percentage correctly for mid usage", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={175} buildPointsMax={250} />
    );

    expect(screen.getByText("70.0%")).toBeInTheDocument();
  });

  it("calculates percentage correctly for high usage", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={225} buildPointsMax={250} />
    );

    expect(screen.getByText("90.0%")).toBeInTheDocument();
  });

  it("displays full keyboard hints", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={100} buildPointsMax={250} />
    );

    expect(screen.getByText(/↑.*↓.*Navigate/)).toBeInTheDocument();
    expect(screen.getByText(/ENTER.*Add/)).toBeInTheDocument();
    expect(screen.getByText(/ESC.*Close/)).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const { container } = render(
      <ModuleSlotBrowserHeader buildPointsUsed={100} buildPointsMax={250} />
    );

    const header = container.querySelector("[role='region']");
    expect(header).toBeInTheDocument();
    expect(header).toHaveAttribute(
      "aria-label",
      "Module slot browser header"
    );
  });

  it("has aria labels for build points display", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={180} buildPointsMax={250} />
    );

    const bpValue = screen.getByLabelText(
      "Build points: 180 of 250"
    );
    expect(bpValue).toBeInTheDocument();
  });

  it("has aria labels for progress bar", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={180} buildPointsMax={250} />
    );

    // Progress bar should have aria-label with percentage
    const progressLabel = screen.getByLabelText(/Build points usage: 72\.0%/);
    expect(progressLabel).toBeInTheDocument();
  });

  it("renders when build points used is zero", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={0} buildPointsMax={250} />
    );

    expect(screen.getByText("0/250")).toBeInTheDocument();
    expect(screen.getByText("0.0%")).toBeInTheDocument();
  });

  it("renders when at maximum build points", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={250} buildPointsMax={250} />
    );

    expect(screen.getByText("250/250")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();
  });

  it("renders when build points exceed maximum (edge case)", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={300} buildPointsMax={250} />
    );

    expect(screen.getByText("300/250")).toBeInTheDocument();
    expect(screen.getByText("120.0%")).toBeInTheDocument();
  });

  it("renders with small maximum build points", () => {
    render(
      <ModuleSlotBrowserHeader buildPointsUsed={5} buildPointsMax={10} />
    );

    expect(screen.getByText("5/10")).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();
  });

  it("renders with large build points values", () => {
    render(
      <ModuleSlotBrowserHeader
        buildPointsUsed={50000}
        buildPointsMax={100000}
      />
    );

    expect(screen.getByText("50000/100000")).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();
  });
});
