import React from "react";
import { render, screen } from "@testing-library/react";
import { ModuleSlotCard } from "../ModuleSlotCard";
import type { ModuleSlot } from "@frigate/api-client";

const mockSlot: ModuleSlot = {
  id: "aux-support-system",
  name: "AUX SUPPORT",
  description: "Auxiliary support system for ship operations.",
  base_cost: 5,
  max_slots: 2,
  required: true,
  groups: ["Essential", "Support"],
  hasVariants: false,
  base_hp: 100,
  base_power_consumption: 10,
  base_heat_generation: 5,
  base_weight: 200,
};

const mockSlotWithCredits: ModuleSlot = {
  ...mockSlot,
  id: "premium-support-system",
  name: "PREMIUM SUPPORT",
  credit_cost: 50000,
};

describe("ModuleSlotCard", () => {
  it("renders slot info and add button", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.getByText("AUX SUPPORT")).toBeInTheDocument();
    expect(screen.getByText("[ADD]")).toBeInTheDocument();
  });

  it("displays build point cost", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.getByText("5 BP")).toBeInTheDocument();
  });

  it("displays credit cost when present", () => {
    render(
      <ModuleSlotCard
        slot={mockSlotWithCredits}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.getByText("5 BP")).toBeInTheDocument();
    // Credit cost is formatted with thousand separators
    expect(screen.getByText(/50,000 CR/)).toBeInTheDocument();
  });

  it("does not display credit cost when zero or not set", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.queryByText(/CR/)).toBeNull();
  });

  it("displays slot count indicator", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={1}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("shows [REQ] badge for required slots", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.getByText("[REQ]")).toBeInTheDocument();
  });

  it("disables add button when at max slots", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={2}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    expect(screen.getByText("[ADD]")).toBeDisabled();
  });

  it("disables add button when over budget", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={98}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
      />
    );
    // Cannot add when buildPointsUsed (98) + base_cost (5) > maxBuildPoints (100)
    expect(screen.getByText("[ADD]")).toBeDisabled();
    expect(screen.getByText("[OVER BUDGET]")).toBeInTheDocument();
  });

  it("shows truncated description when not compact", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
        compact={false}
      />
    );
    expect(screen.getByText("Auxiliary support system for ship operations.")).toBeInTheDocument();
  });

  it("hides description when compact", () => {
    render(
      <ModuleSlotCard
        slot={mockSlot}
        currentCount={0}
        maxBuildPoints={100}
        buildPointsUsed={0}
        onAdd={() => {}}
        onToggleDetails={() => {}}
        isExpanded={false}
        compact={true}
      />
    );
    expect(screen.queryByText("Auxiliary support system for ship operations.")).toBeNull();
  });
});
