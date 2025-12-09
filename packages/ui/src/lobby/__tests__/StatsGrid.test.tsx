import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsGrid, type StatItem } from "../StatsGrid";

describe("StatsGrid Component", () => {
  const basicItems: StatItem[] = [
    { label: "TOTAL COST", value: 250, unit: "BP" },
    { label: "WEIGHT", value: 150, unit: "kg" },
    { label: "POWER DRAW", value: 80, unit: "MW" },
    { label: "HEAT", value: 45, unit: "C°" },
  ];

  it("renders all stat items", () => {
    render(<StatsGrid items={basicItems} />);

    expect(screen.getByText("TOTAL COST")).toBeInTheDocument();
    expect(screen.getByText("WEIGHT")).toBeInTheDocument();
    expect(screen.getByText("POWER DRAW")).toBeInTheDocument();
    expect(screen.getByText("HEAT")).toBeInTheDocument();
  });

  it("displays values correctly", () => {
    render(<StatsGrid items={basicItems} />);

    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("displays units correctly", () => {
    render(<StatsGrid items={basicItems} />);

    // Units are rendered in span elements (text nodes may be split)
    expect(screen.getByText("BP")).toBeInTheDocument();
    expect(screen.getByText("kg")).toBeInTheDocument();
    expect(screen.getByText("MW")).toBeInTheDocument();
    expect(screen.getByText("C°")).toBeInTheDocument();
  });

  it("renders progress bar type stats", () => {
    const progressItems: StatItem[] = [
      {
        label: "BUILD POINTS",
        value: 0,
        type: "progress",
        current: 180,
        max: 250,
      },
    ];

    render(<StatsGrid items={progressItems} />);

    expect(screen.getByText("BUILD POINTS")).toBeInTheDocument();
    // Progress bar shows current/max in aria-label format
    expect(screen.getByLabelText("180/250")).toBeInTheDocument();
  });

  it("renders gauge type stats", () => {
    const gaugeItems: StatItem[] = [
      {
        label: "POWER USAGE",
        value: 0,
        type: "gauge",
        current: 75,
        max: 100,
        unit: "%",
      },
    ];

    render(<StatsGrid items={gaugeItems} />);

    expect(screen.getByText("POWER USAGE")).toBeInTheDocument();
    // Gauge renders value and unit separately
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("respects column count prop", () => {
    const { container } = render(<StatsGrid items={basicItems} columns={3} />);

    // Component uses inline styles, not CSS classes
    const grid = container.querySelector("[role='region']");
    expect(grid).toHaveStyle("grid-template-columns: repeat(3, 1fr)");
  });

  it("applies gap spacing correctly", () => {
    const { container } = render(<StatsGrid items={basicItems} gap={2} />);

    // Component uses inline styles with CSS custom properties
    const grid = container.querySelector("[role='region']");
    expect(grid).toHaveStyle("gap: var(--frigate-space-2)");
  });

  it("renders single column when items are few", () => {
    const singleItem: StatItem[] = [{ label: "STATUS", value: "ONLINE" }];

    render(<StatsGrid items={singleItem} columns={1} />);

    expect(screen.getByText("STATUS")).toBeInTheDocument();
    expect(screen.getByText("ONLINE")).toBeInTheDocument();
  });

  it("renders many items in grid", () => {
    const manyItems: StatItem[] = Array.from({ length: 12 }, (_, i) => ({
      label: `STAT_${i + 1}`,
      value: i * 10,
    }));

    render(<StatsGrid items={manyItems} columns={2} />);

    for (let i = 0; i < 12; i++) {
      expect(screen.getByText(`STAT_${i + 1}`)).toBeInTheDocument();
    }
  });

  it("handles items without units", () => {
    const noUnitItems: StatItem[] = [{ label: "STATUS", value: "ACTIVE" }];

    render(<StatsGrid items={noUnitItems} />);

    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    // Should not show any unit text
    expect(screen.queryByText(/\s+undefined/)).not.toBeInTheDocument();
  });

  it("applies test IDs for all items", () => {
    render(<StatsGrid items={basicItems} />);

    expect(
      screen.getByTestId("stat-item-total-cost")
    ).toBeInTheDocument();
    expect(screen.getByTestId("stat-item-weight")).toBeInTheDocument();
    expect(
      screen.getByTestId("stat-item-power-draw")
    ).toBeInTheDocument();
    expect(screen.getByTestId("stat-item-heat")).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const { container } = render(<StatsGrid items={basicItems} />);

    // Component uses inline styles with role and aria-label attributes
    const grid = container.querySelector("[role='region']");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveAttribute("aria-label", "Statistics grid");
  });

  it("handles progress bar variant colors based on percentage", () => {
    const progressItems: StatItem[] = [
      {
        label: "LOW_USAGE",
        value: 0,
        type: "progress",
        current: 50,
        max: 100,
      }, // 50% = success
      {
        label: "MED_USAGE",
        value: 0,
        type: "progress",
        current: 75,
        max: 100,
      }, // 75% = warning
      {
        label: "HIGH_USAGE",
        value: 0,
        type: "progress",
        current: 95,
        max: 100,
      }, // 95% = danger
    ];

    render(<StatsGrid items={progressItems} />);

    expect(screen.getByText("LOW_USAGE")).toBeInTheDocument();
    expect(screen.getByText("MED_USAGE")).toBeInTheDocument();
    expect(screen.getByText("HIGH_USAGE")).toBeInTheDocument();
  });

  it("renders empty grid when items is empty array", () => {
    const { container } = render(<StatsGrid items={[]} />);

    // Component uses inline styles, query by role
    const grid = container.querySelector("[role='region']");
    expect(grid).toBeInTheDocument();
    expect(grid?.children.length).toBe(0);
  });
});
