import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, vi, expect } from "vitest";
import { ShipClassFilters } from "../ShipClassFilters";

describe("ShipClassFilters", () => {
  it("renders filters and shows result count", () => {
    const setFilterSize = vi.fn();
    const setFilterRole = vi.fn();
    const setSortBy = vi.fn();
    const setSortOrder = vi.fn();
    const onClear = vi.fn();

    render(
      <ShipClassFilters
        filterSize={"all"}
        setFilterSize={setFilterSize}
        filterRole={"all"}
        setFilterRole={setFilterRole}
        sortBy={"name"}
        setSortBy={setSortBy}
        sortOrder={"asc"}
        setSortOrder={setSortOrder}
        onClear={onClear}
        resultCount={3}
      />
    );

    // The rendered markup may split the number and words into separate nodes,
    // so match across the full textContent using a flexible regex.
    expect(screen.getByText(/3[\s\S]*CLASSES/i)).toBeTruthy();

    const clearBtn = screen.getByText(/\[CLEAR FILTERS\]/i);
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });
});
