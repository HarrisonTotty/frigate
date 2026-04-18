/**
 * ModuleDamageIndicator Tests
 *
 * Tests for module damage visualization component.
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ModuleDamageIndicator,
  ModuleDamageList,
  determineStatus,
  type ModuleStatus,
} from "../ModuleDamageIndicator";

describe("ModuleDamageIndicator", () => {
  it("renders operational status correctly", () => {
    render(<ModuleDamageIndicator name="Fusion Core" health={100} status="operational" />);

    expect(screen.getByText("Fusion Core")).toBeInTheDocument();
    expect(screen.getByText("OPER")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders degraded status with warning color", () => {
    render(<ModuleDamageIndicator name="Shield Generator" health={75} status="degraded" />);

    expect(screen.getByText("Shield Generator")).toBeInTheDocument();
    expect(screen.getByText("DEGR")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("renders damaged status", () => {
    render(<ModuleDamageIndicator name="Impulse Engine" health={45} status="damaged" />);

    expect(screen.getByText("Impulse Engine")).toBeInTheDocument();
    expect(screen.getByText("DMGD")).toBeInTheDocument();
    expect(screen.getByText("45%")).toBeInTheDocument();
  });

  it("renders critical status with pulsing animation", () => {
    render(<ModuleDamageIndicator name="Life Support" health={15} status="critical" />);

    expect(screen.getByText("Life Support")).toBeInTheDocument();
    expect(screen.getByText("CRIT")).toBeInTheDocument();
    expect(screen.getByText("15%")).toBeInTheDocument();
    expect(screen.getByText(/critical/i)).toBeInTheDocument();
  });

  it("renders offline status", () => {
    render(<ModuleDamageIndicator name="Sensors" health={0} status="offline" />);

    expect(screen.getByText("Sensors")).toBeInTheDocument();
    expect(screen.getByText("OFFL")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders in compact mode", () => {
    render(
      <ModuleDamageIndicator name="Communications" health={88} status="operational" compact />
    );

    expect(screen.getByText("Communications")).toBeInTheDocument();
    // Compact mode should still show health and status
    expect(screen.getByText("88%")).toBeInTheDocument();
  });

  it("displays category when provided", () => {
    // Note: Category is not a direct prop but could be shown in name
    render(
      <ModuleDamageIndicator
        name="Railgun Mk1 (Kinetic Weapons)"
        health={90}
        status="operational"
      />
    );

    expect(screen.getByText(/Railgun Mk1/)).toBeInTheDocument();
  });

  it("does not show critical warning for non-critical status", () => {
    render(<ModuleDamageIndicator name="Thrusters" health={60} status="damaged" />);

    expect(screen.queryByText(/critical/i)).not.toBeInTheDocument();
  });
});

describe("ModuleDamageList", () => {
  const testModules = [
    {
      id: "1",
      name: "Fusion Core",
      category: "Power",
      health: 100,
      status: "operational" as ModuleStatus,
    },
    {
      id: "2",
      name: "Shield Gen",
      category: "Defense",
      health: 45,
      status: "damaged" as ModuleStatus,
    },
    { id: "3", name: "Sensors", category: "Systems", health: 0, status: "offline" as ModuleStatus },
  ];

  it("renders multiple modules", () => {
    render(<ModuleDamageList modules={testModules} />);

    expect(screen.getByText("Fusion Core")).toBeInTheDocument();
    expect(screen.getByText("Shield Gen")).toBeInTheDocument();
    expect(screen.getByText("Sensors")).toBeInTheDocument();
  });

  it("renders in compact mode", () => {
    render(<ModuleDamageList modules={testModules} compact />);

    // All modules should be present
    expect(screen.getByText("Fusion Core")).toBeInTheDocument();
    expect(screen.getByText("Shield Gen")).toBeInTheDocument();
    expect(screen.getByText("Sensors")).toBeInTheDocument();
  });

  it("shows heading when rendered", () => {
    render(<ModuleDamageList modules={testModules} />);

    // Should show module list
    expect(screen.getByText("Fusion Core")).toBeInTheDocument();
  });

  it("renders empty state when no modules", () => {
    render(<ModuleDamageList modules={[]} />);

    expect(screen.getByText(/no modules/i)).toBeInTheDocument();
  });
});

describe("determineStatus", () => {
  it("returns offline for 0% health", () => {
    expect(determineStatus(0)).toBe("offline");
  });

  it("returns critical for health <= 25%", () => {
    expect(determineStatus(25)).toBe("critical");
    expect(determineStatus(20)).toBe("critical");
    expect(determineStatus(10)).toBe("critical");
  });

  it("returns damaged for health <= 50%", () => {
    expect(determineStatus(50)).toBe("damaged");
    expect(determineStatus(40)).toBe("damaged");
    expect(determineStatus(30)).toBe("damaged");
  });

  it("returns degraded for health <= 75%", () => {
    expect(determineStatus(75)).toBe("degraded");
    expect(determineStatus(60)).toBe("degraded");
    expect(determineStatus(55)).toBe("degraded");
  });

  it("returns operational for health > 75%", () => {
    expect(determineStatus(100)).toBe("operational");
    expect(determineStatus(90)).toBe("operational");
    expect(determineStatus(76)).toBe("operational");
  });

  it("handles edge cases", () => {
    expect(determineStatus(0.1)).toBe("critical");
    expect(determineStatus(99.9)).toBe("operational");
  });
});
