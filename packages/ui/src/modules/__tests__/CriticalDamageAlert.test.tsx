/**
 * CriticalDamageAlert Tests
 *
 * Tests for critical damage alert components.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CriticalDamageAlert,
  CriticalDamageToast,
  type CriticalModuleAlert,
} from "../CriticalDamageAlert";
import type { ModuleStatus } from "../ModuleDamageIndicator";

const mockCriticalAlerts: CriticalModuleAlert[] = [
  {
    id: "alert-1",
    moduleId: "mod-1",
    moduleName: "Life Support",
    category: "Systems",
    health: 5,
    status: "critical",
    timestamp: Date.now() - 5000,
    acknowledged: false,
  },
  {
    id: "alert-2",
    moduleId: "mod-2",
    moduleName: "Reactor Core",
    category: "Power",
    health: 12,
    status: "critical",
    timestamp: Date.now() - 3000,
    acknowledged: false,
  },
];

describe("CriticalDamageAlert", () => {
  let onAcknowledge: ReturnType<typeof vi.fn>;
  let onGoToEngineering: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onAcknowledge = vi.fn();
    onGoToEngineering = vi.fn();
  });

  it("renders critical alert modal", () => {
    render(
      <CriticalDamageAlert
        alerts={mockCriticalAlerts}
        onAcknowledge={onAcknowledge}
        onGoToEngineering={onGoToEngineering}
      />
    );

    expect(screen.getByText(/critical/i)).toBeInTheDocument();
    expect(screen.getByText("Life Support")).toBeInTheDocument();
    expect(screen.getByText("Reactor Core")).toBeInTheDocument();
  });

  it("displays module health percentages", () => {
    render(
      <CriticalDamageAlert
        alerts={mockCriticalAlerts}
        onAcknowledge={onAcknowledge}
        onGoToEngineering={onGoToEngineering}
      />
    );

    expect(screen.getByText("5%")).toBeInTheDocument();
    expect(screen.getByText("12%")).toBeInTheDocument();
  });

  it("shows alert count when multiple modules", () => {
    render(
      <CriticalDamageAlert
        alerts={mockCriticalAlerts}
        onAcknowledge={onAcknowledge}
        onGoToEngineering={onGoToEngineering}
      />
    );

    expect(screen.getByText(/2.*module/i)).toBeInTheDocument();
  });

  it("calls onAcknowledge when acknowledged", async () => {
    const user = userEvent.setup();
    render(
      <CriticalDamageAlert
        alerts={mockCriticalAlerts}
        onAcknowledge={onAcknowledge}
        onGoToEngineering={onGoToEngineering}
      />
    );

    const acknowledgeButton = screen.getByRole("button", { name: /acknowledge/i });
    await user.click(acknowledgeButton);

    expect(onAcknowledge).toHaveBeenCalled();
  });

  it("calls onGoToEngineering when navigation clicked", async () => {
    const user = userEvent.setup();
    render(
      <CriticalDamageAlert
        alerts={mockCriticalAlerts}
        onAcknowledge={onAcknowledge}
        onGoToEngineering={onGoToEngineering}
      />
    );

    const engineeringButton = screen.getByRole("button", { name: /engineering/i });
    await user.click(engineeringButton);

    expect(onGoToEngineering).toHaveBeenCalled();
  });

  it("allows acknowledging individual alerts", async () => {
    const user = userEvent.setup();
    render(
      <CriticalDamageAlert
        alerts={mockCriticalAlerts}
        onAcknowledge={onAcknowledge}
        onGoToEngineering={onGoToEngineering}
      />
    );

    // Find individual acknowledge buttons
    const individualButtons = screen.getAllByRole("button", { name: /dismiss|×/i });
    if (individualButtons.length > 0) {
      await user.click(individualButtons[0]);
      expect(onAcknowledge).toHaveBeenCalledWith("alert-1");
    }
  });

  it("does not render when no alerts", () => {
    const { container } = render(
      <CriticalDamageAlert
        alerts={[]}
        onAcknowledge={onAcknowledge}
        onGoToEngineering={onGoToEngineering}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("applies flashing animation class", () => {
    const { container } = render(
      <CriticalDamageAlert
        alerts={mockCriticalAlerts}
        onAcknowledge={onAcknowledge}
        onGoToEngineering={onGoToEngineering}
      />
    );

    const alertElement = container.querySelector('[class*="flash"]');
    expect(alertElement).toBeInTheDocument();
  });
});

describe("CriticalDamageToast", () => {
  let onAcknowledge: ReturnType<typeof vi.fn>;
  let onGoToEngineering: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onAcknowledge = vi.fn();
    onGoToEngineering = vi.fn();
  });

  it("renders toast notification", () => {
    render(
      <CriticalDamageToast
        alerts={mockCriticalAlerts}
        onDismiss={onAcknowledge}
        onClick={onGoToEngineering}
      />
    );

    expect(screen.getByText(/critical/i)).toBeInTheDocument();
  });

  it("shows count of critical modules", () => {
    render(
      <CriticalDamageToast
        alerts={mockCriticalAlerts}
        onDismiss={onAcknowledge}
        onClick={onGoToEngineering}
      />
    );

    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it("lists critical module names", () => {
    render(
      <CriticalDamageToast
        alerts={mockCriticalAlerts}
        onDismiss={onAcknowledge}
        onClick={onGoToEngineering}
      />
    );

    expect(screen.getByText(/Life Support/)).toBeInTheDocument();
    expect(screen.getByText(/Reactor Core/)).toBeInTheDocument();
  });

  it("calls onAcknowledge when dismissed", async () => {
    const user = userEvent.setup();
    render(
      <CriticalDamageToast
        alerts={mockCriticalAlerts}
        onDismiss={onAcknowledge}
        onClick={onGoToEngineering}
      />
    );

    const dismissButton = screen.getByRole("button", { name: /dismiss|×/i });
    await user.click(dismissButton);

    expect(onAcknowledge).toHaveBeenCalled();
  });

  it("calls onGoToEngineering when clicked", async () => {
    const user = userEvent.setup();
    render(
      <CriticalDamageToast
        alerts={mockCriticalAlerts}
        onDismiss={onAcknowledge}
        onClick={onGoToEngineering}
      />
    );

    const toastBody = screen.getByText(/Life Support/).closest("div");
    if (toastBody) {
      await user.click(toastBody);
      expect(onGoToEngineering).toHaveBeenCalled();
    }
  });

  it("does not render when no alerts", () => {
    const { container } = render(
      <CriticalDamageToast alerts={[]} onDismiss={onAcknowledge} onClick={onGoToEngineering} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("truncates long module lists", () => {
    const manyAlerts = Array.from({ length: 10 }, (_, i) => ({
      id: `alert-${i}`,
      moduleId: `mod-${i}`,
      moduleName: `Module ${i}`,
      category: "Systems",
      health: 5,
      status: "critical" as ModuleStatus,
      timestamp: Date.now(),
      acknowledged: false,
    }));

    render(
      <CriticalDamageToast
        alerts={manyAlerts}
        onDismiss={onAcknowledge}
        onClick={onGoToEngineering}
      />
    );

    // Should show "and X more" or similar
    expect(screen.getByText(/more|additional/i)).toBeInTheDocument();
  });

  it("displays time since alert", () => {
    const recentAlert: CriticalModuleAlert[] = [
      {
        id: "alert-new",
        moduleId: "mod-new",
        moduleName: "Shields",
        category: "Defense",
        health: 3,
        status: "critical",
        timestamp: Date.now() - 2000, // 2 seconds ago
        acknowledged: false,
      },
    ];

    render(
      <CriticalDamageToast
        alerts={recentAlert}
        onDismiss={onAcknowledge}
        onClick={onGoToEngineering}
      />
    );

    // Should show time elapsed
    expect(screen.getByText(/2s|just now|seconds/i)).toBeInTheDocument();
  });
});
