import { describe, expect, test } from "bun:test";
import { validateFirst } from "../pagination.validator";

describe("validateFirst", () => {
  test("defaults to 10", () => {
    expect(validateFirst()).toBe(10);
  });

  test("accepts valid value", () => {
    expect(validateFirst(20)).toBe(20);
  });

  test("rejects zero", () => {
    expect(() => validateFirst(0)).toThrow(
      "first must be a positive integer"
    );
  });

  test("rejects negative value", () => {
    expect(() => validateFirst(-1)).toThrow(
      "first must be a positive integer"
    );
  });

  test("rejects value greater than 100", () => {
    expect(() => validateFirst(101)).toThrow(
      "first cannot exceed 100"
    );
  });

  test("rejects non-integer", () => {
    expect(() => validateFirst(1.5)).toThrow(
      "first must be a positive integer"
    );
  });
});