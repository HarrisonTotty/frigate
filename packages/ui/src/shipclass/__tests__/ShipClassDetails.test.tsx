import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ShipClassDetails } from "../ShipClassDetails";

describe("ShipClassDetails", () => {
  it("shows loading state", () => {
    render(<ShipClassDetails details={null} loading={true} />);
    expect(screen.getByText(/LOADING DETAILS/i)).toBeTruthy();
  });

  it("shows failure state", () => {
    render(<ShipClassDetails details={null} loading={false} />);
    expect(screen.getByText(/FAILED TO LOAD DETAILS/i)).toBeTruthy();
  });

  it("renders details content", () => {
    const details = {
      id: "x",
      name: "X",
      description: "desc",
      size: "Small",
      role: "Combat",
      max_weight: 0,
      max_modules: 0,
      base_hull: 1,
      base_shields: 1,
      build_points: 1,
      bonuses: { combat: [], defense: [], mobility: [], utility: [], efficiency: [] },
      technical_specs: {},
      manufacturers: {},
      lore: null,
      year_introduced: null,
      notable_ships: [],
    } as any;

    render(<ShipClassDetails details={details} loading={false} />);
    expect(screen.getByText("X")).toBeTruthy();
  });
});
