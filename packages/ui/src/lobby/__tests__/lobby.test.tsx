import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InstalledModulesList } from "../InstalledModulesList";
import { ShipStatsPanel, type ShipStats } from "../ShipStatsPanel";

describe("Lobby components", () => {
  describe("InstalledModulesList", () => {
    it("renders empty state with uppercase text", () => {
      render(<InstalledModulesList instances={[]} />);
      expect(screen.getByText("NO MODULES INSTALLED")).toBeDefined();
    });

    it("has proper ARIA role for list", () => {
      render(<InstalledModulesList instances={[]} />);
      expect(screen.getByRole("list")).toBeDefined();
    });
  });

  describe("ShipStatsPanel", () => {
    const mockStats: ShipStats = {
      cost: 1500,
      creditCost: 150000,
      creditBudget: 1000000,
      shipClassCost: 50000,
      weight: 850,
      weightMax: 1000,
      hp: 100,
      power: 280,
      powerMax: 500,
      heat: 320,
      heatMax: 600,
      buildPointsUsed: 75,
      buildPointsMax: 100,
      warnings: [],
    };

    it("renders panel with header", () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText("SHIP STATISTICS")).toBeDefined();
    });

    it("displays hull points stat", () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText("100 HP")).toBeDefined();
    });

    it("displays weight constraint", () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText("WEIGHT")).toBeDefined();
      expect(screen.getByText("850/1000 t")).toBeDefined();
    });

    it("displays power constraint", () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText("POWER")).toBeDefined();
      expect(screen.getByText("280/500 MW")).toBeDefined();
    });

    it("displays cooling constraint", () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText("COOLING")).toBeDefined();
      expect(screen.getByText("320/600 K")).toBeDefined();
    });

    it("displays build points allocation", () => {
      render(<ShipStatsPanel stats={mockStats} />);
      expect(screen.getByText("BUILD POINTS")).toBeDefined();
      expect(screen.getByText("75/100 BP")).toBeDefined();
    });

    it("shows warning indicator when weight exceeds limit", () => {
      const overweightStats: ShipStats = {
        ...mockStats,
        weight: 1200,
        weightMax: 1000,
      };
      render(<ShipStatsPanel stats={overweightStats} />);
      // Over-limit shows with [!] indicator
      expect(screen.getByText("1200/1000 t [!]")).toBeDefined();
    });

    it("shows warning indicator when power exceeds limit", () => {
      const overpowerStats: ShipStats = {
        ...mockStats,
        power: 600,
        powerMax: 500,
      };
      render(<ShipStatsPanel stats={overpowerStats} />);
      expect(screen.getByText("600/500 MW [!]")).toBeDefined();
    });

    it("shows heat exceeding cooling as informational (no warning)", () => {
      // Heat exceeding cooling is not a blocking constraint
      // The bar still shows the values but doesn't add a warning
      const overheatStats: ShipStats = {
        ...mockStats,
        heat: 700,
        heatMax: 600,
      };
      render(<ShipStatsPanel stats={overheatStats} />);
      // Heat over limit still displays with indicator
      expect(screen.getByText("700/600 K [!]")).toBeDefined();
    });

    it("displays warnings from stats object", () => {
      const statsWithWarnings: ShipStats = {
        ...mockStats,
        warnings: ["Critical error", "Power failure"],
      };
      render(<ShipStatsPanel stats={statsWithWarnings} />);
      expect(screen.getByText("Critical error")).toBeDefined();
      expect(screen.getByText("Power failure")).toBeDefined();
    });

    it("has proper container structure", () => {
      const { container } = render(<ShipStatsPanel stats={mockStats} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.tagName).toBe("DIV");
      expect(wrapper.style.fontFamily).toBe("var(--frigate-font-mono)");
    });
  });
});
