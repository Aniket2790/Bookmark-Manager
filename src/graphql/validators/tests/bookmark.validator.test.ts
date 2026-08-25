import { describe, expect, test } from "bun:test";
import {
  validateBookmarkTags,
  validateBookmarkTitle,
  validateBookmarkUrl,
} from "../bookmark.validator";

describe("validateBookmarkTitle", () => {
  test("returns trimmed title", () => {
    expect(
      validateBookmarkTitle("  Prisma Docs  ")
    ).toBe("Prisma Docs");
  });

  test("rejects empty title", () => {
    expect(() => validateBookmarkTitle("   ")).toThrow(
      "Bookmark title cannot be empty"
    );
  });

  test("rejects title longer than 200 characters", () => {
    expect(() =>
      validateBookmarkTitle("a".repeat(201))
    ).toThrow(
      "Bookmark title cannot exceed 200 characters"
    );
  });
});

describe("validateBookmarkUrl", () => {
  test("accepts HTTPS URL", () => {
    expect(
      validateBookmarkUrl("https://example.com")
    ).toBe("https://example.com");
  });

  test("accepts HTTP URL", () => {
    expect(
      validateBookmarkUrl("http://example.com")
    ).toBe("http://example.com");
  });

  test("rejects invalid URL", () => {
    expect(() =>
      validateBookmarkUrl("invalid-url")
    ).toThrow(
      "Bookmark URL must be a valid HTTP or HTTPS URL"
    );
  });

  test("rejects non HTTP/HTTPS URL", () => {
    expect(() =>
      validateBookmarkUrl("ftp://example.com")
    ).toThrow(
      "Bookmark URL must be a valid HTTP or HTTPS URL"
    );
  });
});

describe("validateBookmarkTags", () => {
  test("returns empty array when tags are undefined", () => {
    expect(validateBookmarkTags()).toEqual([]);
  });

  test("trims tags and removes empty tags", () => {
    expect(
      validateBookmarkTags([
        " prisma ",
        "",
        " database ",
        "   ",
      ])
    ).toEqual(["prisma", "database"]);
  });

  test("rejects more than 20 tags", () => {
    const tags = Array.from(
      { length: 21 },
      (_, index) => `tag-${index}`
    );

    expect(() => validateBookmarkTags(tags)).toThrow(
      "A bookmark cannot have more than 20 tags"
    );
  });
});