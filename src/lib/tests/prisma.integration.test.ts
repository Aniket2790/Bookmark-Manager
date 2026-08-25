import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import prisma from "../prisma";

describe("PostgreSQL integration", () => {
  let folderId: string;
  let bookmarkId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("creates and reads a folder", async () => {
    const folder = await prisma.folder.create({
      data: {
        name: "Integration Test Folder",
      },
    });

    folderId = folder.id;

    expect(folder.name).toBe("Integration Test Folder");

    const foundFolder = await prisma.folder.findUnique({
      where: {
        id: folderId,
      },
    });

    expect(foundFolder).not.toBeNull();
    expect(foundFolder?.id).toBe(folderId);
  });

  test("creates and reads a bookmark", async () => {
    const bookmark = await prisma.bookmark.create({
      data: {
        title: "Integration Test Bookmark",
        url: "https://example.com",
        tags: ["test", "integration"],
        folderId,
      },
    });

    bookmarkId = bookmark.id;

    expect(bookmark.title).toBe(
      "Integration Test Bookmark"
    );
    expect(bookmark.folderId).toBe(folderId);

    const foundBookmark =
      await prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

    expect(foundBookmark).not.toBeNull();
    expect(foundBookmark?.id).toBe(bookmarkId);
  });

  test("searches bookmarks by title substring", async () => {
    const matches = await prisma.bookmark.findMany({
      where: {
        folderId,
        title: {
          contains: "Integration Test",
          mode: "insensitive",
        },
      },
    });

    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.id).toBe(bookmarkId);
  });

  test("deletes bookmark and folder", async () => {
    await prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });

    const deletedBookmark =
      await prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

    expect(deletedBookmark).toBeNull();

    await prisma.folder.delete({
      where: {
        id: folderId,
      },
    });

    const deletedFolder =
      await prisma.folder.findUnique({
        where: {
          id: folderId,
        },
      });

    expect(deletedFolder).toBeNull();
  });
});