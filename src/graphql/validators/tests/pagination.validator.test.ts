import { describe, expect, test } from "bun:test";
import { validateTake } from "../pagination.validator";

describe("validateTake", () => {
  test("defaults to 10", () => {
    expect(validateTake()).toBe(10);
  });

  test("accepts valid value", () => {
    expect(validateTake(20)).toBe(20);
  });

  test("rejects zero", () => {
    expect(() => validateTake(0)).toThrow(
      "take must be a positive integer"
    );
  });

  test("rejects negative value", () => {
    expect(() => validateTake(-1)).toThrow(
      "take must be a positive integer"
    );
  });

  test("rejects value greater than 100", () => {
    expect(() => validateTake(101)).toThrow(
      "take cannot exceed 100"
    );
  });

  test("rejects non-integer", () => {
    expect(() => validateTake(1.5)).toThrow(
      "take must be a positive integer"
    );
  });
});
