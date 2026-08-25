import { describe, expect, test } from "bun:test";
import { validateFolderName } from "../folder.validator";

describe("validateFolderName", () => {
  test("returns trimmed folder name", () => {
    const result = validateFolderName("  Development  ");

    expect(result).toBe("Development");
  });

  test("rejects empty folder name", () => {
    expect(() => validateFolderName("   ")).toThrow(
      "Folder name cannot be empty"
    );
  });

  test("rejects folder name longer than 100 characters", () => {
    const name = "a".repeat(101);

    expect(() => validateFolderName(name)).toThrow(
      "Folder name cannot exceed 100 characters"
    );
  });
});