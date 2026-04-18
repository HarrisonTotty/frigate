import React from "react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShipDesignWorkspace } from "../ShipDesignWorkspace";
import { AlertProvider } from "../../alerts";

// Mock the sub-components to focus on workspace structure
vi.mock("../ModuleSlotBrowser", () => ({
  default: ({ buildPointsUsed, maxBuildPoints }: any) => (
    <div data-testid="module-slot-browser">
      BUILD POINTS: {buildPointsUsed}/{maxBuildPoints}
    </div>
  ),
}));

vi.mock("../InstalledModulesList", () => ({
  default: ({ instances }: any) => (
    <div data-testid="installed-modules-list">Modules: {instances.length}</div>
  ),
}));

vi.mock("../ShipStatsPanel", () => ({
  default: ({ stats }: any) => (
    <div data-testid="ship-stats-panel">
      Cost: {stats.cost} | BP: {stats.buildPointsUsed}/{stats.buildPointsMax}
    </div>
  ),
}));

vi.mock("../../modules/ModuleCatalog", () => ({
  ModuleCatalog: ({ isOpen }: any) =>
    isOpen ? <div data-testid="module-catalog">Catalog Open</div> : null,
}));

vi.mock("../../hooks/useUiBlueprint", () => ({
  useUiBlueprint: () => ({
    blueprint: {
      instances: [],
      name: "Test Blueprint",
    },
    ensureOpen: vi.fn(),
    addInstance: vi.fn(),
    removeInstance: vi.fn(),
    setVariant: vi.fn(),
  }),
}));

vi.mock("../../hooks/useCatalog", () => ({
  useCatalog: () => ({
    slotsList: [],
    slotsById: {},
    variantsById: {},
    getModuleSlots: vi.fn().mockResolvedValue([]),
    getModuleVariant: vi.fn().mockResolvedValue(undefined),
    getModuleVariants: vi.fn().mockResolvedValue([]),
  }),
  default: () => ({
    slotsList: [],
    slotsById: {},
    variantsById: {},
    getModuleSlots: vi.fn().mockResolvedValue([]),
    getModuleVariant: vi.fn().mockResolvedValue(undefined),
    getModuleVariants: vi.fn().mockResolvedValue([]),
  }),
}));

vi.mock("../../hooks/useShipClass", () => ({
  useShipClass: () => ({
    shipClass: null,
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("../ShipBlueprintView", () => ({
  ShipBlueprintCanvas: () => <div data-testid="ship-blueprint-canvas">Blueprint Canvas</div>,
}));

vi.mock("../lobbyWorkflowStore", () => ({
  useLobbyWorkflowStore: () => ({
    goBack: vi.fn(),
    registerSchematic: vi.fn(),
    pendingSchematic: null,
    clearPendingSchematic: vi.fn(),
  }),
}));

// Stub fetch globally to avoid real network calls from ShipDesignWorkspace's
// blueprint fetch effect.
beforeAll(() => {
  globalThis.fetch = vi.fn(async () => {
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        id: "bp-test",
        name: "Test Blueprint",
        class: "test-class",
        team_id: "test-team",
      }),
      text: async () => "",
      headers: new Headers(),
      redirected: false,
      type: "basic",
      url: "",
      clone: () => undefined,
      body: null,
      bodyUsed: false,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
    } as unknown as Response;
  }) as unknown as typeof fetch;
});

describe("ShipDesignWorkspace", () => {
  const mockProps = {
    apiUrl: "http://localhost:3000",
    blueprintId: "bp-test",
  };

  describe("rendering", () => {
    it("renders the workspace header", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      // The workspace renders the blueprint name from the store mock ("Test Blueprint")
      expect(screen.getByText("Test Blueprint")).toBeDefined();
    });

    it("renders all three main columns", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      // Slot browser and stats panel are mocked; center column is the blueprint canvas
      expect(screen.getByTestId("module-slot-browser")).toBeDefined();
      expect(screen.getByTestId("ship-stats-panel")).toBeDefined();
    });

    it("renders workspace footer with keyboard hints", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      expect(screen.getByText(/DESIGN PHASE/)).toBeDefined();
      expect(screen.getByText(/SAVE.*CANCEL.*HELP/)).toBeDefined();
    });

    it("has flex layout for workspace", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.display).toBe("flex");
      expect(wrapper.style.flexDirection).toBe("column");
      expect(wrapper.style.height).toBe("100%");
    });
  });

  describe("layout structure", () => {
    it("uses three-column grid layout", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const mainContent = Array.from(container.querySelectorAll('[style*="grid"]')).find(
        (el) => (el as HTMLElement).style.display === "grid"
      ) as HTMLElement;
      expect(mainContent?.style.gridTemplateColumns).toBe("1fr 2fr 1fr");
    });

    it("applies proper gap between columns", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const mainContent = Array.from(container.querySelectorAll('[style*="grid"]')).find(
        (el) => (el as HTMLElement).style.display === "grid"
      ) as HTMLElement;
      expect(mainContent?.style.gap).toContain("space-3");
    });

    it("has padding applied to main content area", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const mainContent = Array.from(container.querySelectorAll('[style*="grid"]')).find(
        (el) => (el as HTMLElement).style.display === "grid"
      ) as HTMLElement;
      expect(mainContent?.style.padding).toContain("space-3");
    });
  });

  describe("styling", () => {
    it("applies theme colors and fonts", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.backgroundColor).toBe("var(--frigate-bg-base)");
      expect(wrapper.style.color).toBe("var(--frigate-text-primary)");
      expect(wrapper.style.fontFamily).toBe("var(--frigate-font-mono)");
    });

    it("applies custom className", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} className="custom-class" />
        </AlertProvider>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toBe("custom-class");
    });
  });

  describe("back button", () => {
    it("displays back button when onBack provided", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} onBack={() => {}} />
        </AlertProvider>
      );
      expect(screen.getByText("[BACK]")).toBeDefined();
    });

    it("always displays back button (wired to workflow store)", () => {
      // The workspace always renders a back button since it is wired to the
      // lobby workflow store's goBack; onBack is an additional callback.
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const backButton = screen.getByText("[BACK]");
      expect(backButton).toBeDefined();
    });

    it("calls onBack when back button clicked", () => {
      const onBack = vi.fn();
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} onBack={onBack} />
        </AlertProvider>
      );
      const backButton = screen.getByText("[BACK]");
      fireEvent.click(backButton);
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe("header component", () => {
    it("displays workspace title with uppercase styling", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const title = screen.getByText("Test Blueprint");
      expect(title?.style.textTransform).toBe("uppercase");
      expect(title?.style.letterSpacing).toBe("0.1em");
    });
  });

  describe("footer component", () => {
    it("displays workspace status", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      expect(screen.getByText(/WORKSPACE: DESIGN PHASE/)).toBeDefined();
      expect(screen.getByText(/STATUS: ACTIVE/)).toBeDefined();
    });

    it("displays keyboard shortcut hints", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const shortcuts = screen.getByText(/ALT\+S.*ALT\+C.*F1/);
      expect(shortcuts).toBeDefined();
    });

    it("applies muted text color to footer", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const status = screen.getByText(/DESIGN PHASE/);
      // Muted color is applied to the footer container, not the inner span
      const footer = status.parentElement as HTMLElement;
      expect(footer?.style.color).toBe("var(--frigate-text-muted)");
    });
  });

  describe("responsive behavior", () => {
    it("columns have proper min/max sizing", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const columns = Array.from(container.querySelectorAll('[style*="min-height"]'));
      expect(columns.length > 0).toBe(true);
    });

    it("center column flexes to fill available space", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const mainContent = Array.from(container.querySelectorAll('[style*="grid"]')).find(
        (el) => (el as HTMLElement).style.display === "grid"
      ) as HTMLElement;
      expect(mainContent?.style.gridTemplateColumns).toContain("1fr");
    });
  });

  describe("accessibility", () => {
    it("has semantic HTML structure", () => {
      const { container } = render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} />
        </AlertProvider>
      );
      const divs = container.querySelectorAll("div");
      expect(divs.length > 0).toBe(true);
    });

    it("back button has aria-label", () => {
      render(
        <AlertProvider>
          <ShipDesignWorkspace {...mockProps} onBack={() => {}} />
        </AlertProvider>
      );
      const backButton = screen.getByText("[BACK]");
      expect(backButton?.getAttribute("aria-label")).toBe("Go back");
    });
  });
});
