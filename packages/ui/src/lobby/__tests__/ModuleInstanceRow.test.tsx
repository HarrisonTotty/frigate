import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModuleInstanceRow } from "../ModuleInstanceRow";

describe("ModuleInstanceRow Component", () => {
  const mockInstance = {
    id: "inst-test-001",
    slot_type: "eng-001",
    variant_id: "var-eng-001",
  };

  const mockVariantInfo = {
    name: "Standard Impulse Drive",
    power_draw: 50,
    heat_generation: 30,
    weight: 25,
  };

  const mockOnEdit = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    mockOnEdit.mockClear();
    mockOnRemove.mockClear();
  });

  it("renders module instance row with correct information", () => {
    render(
      <ModuleInstanceRow
        instance={mockInstance}
        variantInfo={mockVariantInfo}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText("eng-001")).toBeInTheDocument();
    expect(screen.getByText("Standard Impulse Drive")).toBeInTheDocument();
    expect(screen.getByText(/ID: inst-test-001/)).toBeInTheDocument();
  });

  it("displays key stats correctly", () => {
    render(
      <ModuleInstanceRow
        instance={mockInstance}
        variantInfo={mockVariantInfo}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText(/PWR:.*50/)).toBeInTheDocument();
    expect(screen.getByText(/HEAT:.*30/)).toBeInTheDocument();
    expect(screen.getByText(/WEIGHT:.*25/)).toBeInTheDocument();
  });

  it("displays unconfigured badge when variant info is missing", () => {
    render(
      <ModuleInstanceRow
        instance={mockInstance}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText("[UNCONFIGURED]")).toBeInTheDocument();
  });

  it("calls onEdit when [EDIT] button is clicked", async () => {
    render(
      <ModuleInstanceRow
        instance={mockInstance}
        variantInfo={mockVariantInfo}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByTestId("edit-instance-inst-test-001");
    await userEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith("inst-test-001");
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it("calls onRemove when [REMOVE] button is clicked", async () => {
    render(
      <ModuleInstanceRow
        instance={mockInstance}
        variantInfo={mockVariantInfo}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByTestId("remove-instance-inst-test-001");
    await userEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith("inst-test-001");
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard activation for [EDIT] button", async () => {
    render(
      <ModuleInstanceRow
        instance={mockInstance}
        variantInfo={mockVariantInfo}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    const editButton = screen.getByTestId("edit-instance-inst-test-001");
    editButton.focus();

    fireEvent.keyDown(editButton, { key: "Enter" });
    expect(mockOnEdit).toHaveBeenCalledWith("inst-test-001");
  });

  it("supports keyboard activation for [REMOVE] button with Space", async () => {
    render(
      <ModuleInstanceRow
        instance={mockInstance}
        variantInfo={mockVariantInfo}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    const removeButton = screen.getByTestId("remove-instance-inst-test-001");
    removeButton.focus();

    fireEvent.keyDown(removeButton, { key: " " });
    expect(mockOnRemove).toHaveBeenCalledWith("inst-test-001");
  });

  it("has proper accessibility attributes", () => {
    render(
      <ModuleInstanceRow
        instance={mockInstance}
        variantInfo={mockVariantInfo}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    const row = screen.getByTestId("module-instance-row-inst-test-001");
    expect(row).toHaveAttribute("role", "listitem");
    expect(row).toHaveAttribute(
      "aria-label",
      "Module instance: Standard Impulse Drive in eng-001"
    );
  });

  it("handles missing instance properties gracefully", () => {
    const incompleteInstance = {
      // Missing properties will default to undefined
    };

    render(
      <ModuleInstanceRow
        instance={incompleteInstance}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText("[Unknown Slot]")).toBeInTheDocument();
    expect(screen.getByText("[UNCONFIGURED]")).toBeInTheDocument();
  });

  it("renders with zero stats when variant info has zero values", () => {
    const zeroVariantInfo = {
      name: "Zero Module",
      power_draw: 0,
      heat_generation: 0,
      weight: 0,
    };

    render(
      <ModuleInstanceRow
        instance={mockInstance}
        variantInfo={zeroVariantInfo}
        onEdit={mockOnEdit}
        onRemove={mockOnRemove}
      />
    );

    expect(screen.getByText(/PWR:.*0/)).toBeInTheDocument();
    expect(screen.getByText(/HEAT:.*0/)).toBeInTheDocument();
    expect(screen.getByText(/WEIGHT:.*0/)).toBeInTheDocument();
  });
});
