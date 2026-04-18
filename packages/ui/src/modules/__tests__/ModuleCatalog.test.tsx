import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ModuleCatalog } from "../ModuleCatalog";
import { AlertProvider } from "../../alerts";

describe("ModuleCatalog", () => {
  it("renders when open and shows variants", () => {
    render(
      <AlertProvider>
        <ModuleCatalog
          isOpen={true}
          slotType={{ id: "slot-1", name: "Test Slot" } as any}
          variants={[{ id: "v1", name: "Variant 1", desc: "Desc" } as any]}
          onSelect={() => {}}
          onClose={() => {}}
        />
      </AlertProvider>
    );

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("Variant 1")).toBeDefined();
  });

  it("does not render when closed", () => {
    const { container } = render(
      <AlertProvider>
        <ModuleCatalog isOpen={false} />
      </AlertProvider>
    );
    expect(container.firstChild).toBeNull();
  });
});
