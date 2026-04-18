import { describe, it, expect } from "vitest";
import { assert, indexById } from "./index";

describe("assert", () => {
  it("does not throw when condition is truthy", () => {
    expect(() => assert(1, "should not throw")).not.toThrow();
    expect(() => assert("x", "should not throw")).not.toThrow();
    expect(() => assert({}, "should not throw")).not.toThrow();
  });

  it("throws Error with the given message when condition is falsy", () => {
    expect(() => assert(0, "zero is falsy")).toThrow("zero is falsy");
    expect(() => assert(null, "null is falsy")).toThrow("null is falsy");
    expect(() => assert(undefined, "undefined is falsy")).toThrow("undefined is falsy");
    expect(() => assert("", "empty string is falsy")).toThrow("empty string is falsy");
  });
});

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
