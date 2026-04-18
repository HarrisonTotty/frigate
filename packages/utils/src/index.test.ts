import { describe, it, expect } from "vitest";
import { indexById } from "./index";

describe("indexById", () => {
  it("produces a record keyed by id", () => {
    const items = [
      { id: "a", value: 1 },
      { id: "b", value: 2 },
    ];
    expect(indexById(items)).toEqual({
      a: { id: "a", value: 1 },
      b: { id: "b", value: 2 },
    });
  });

  it("applies transform when provided", () => {
    const items = [
      { id: "a", value: 1 },
      { id: "b", value: 2 },
    ];
    expect(indexById(items, (item) => item.value)).toEqual({ a: 1, b: 2 });
  });

  it("returns empty record for empty input", () => {
    expect(indexById([])).toEqual({});
  });

  it("last entry wins when ids collide", () => {
    const items = [
      { id: "a", value: 1 },
      { id: "a", value: 2 },
    ];
    expect(indexById(items)).toEqual({ a: { id: "a", value: 2 } });
  });
});
