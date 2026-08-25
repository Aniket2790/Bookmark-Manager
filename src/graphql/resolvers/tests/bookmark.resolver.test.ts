import { describe, expect, test } from "bun:test";
import { bookmarkResolvers } from "../bookmark.resolver";
import { createMockContext } from "./mock-context";

const sampleBookmark = {
  id: "bookmark-1",
  title: "Prisma Docs",
  url: "https://www.prisma.io/docs",
  tags: ["prisma"],
  folderId: "folder-1",
  createdAt: new Date("2026-01-01"),
};

const sampleFolder = {
  id: "folder-1",
  name: "Development",
  createdAt: new Date("2026-01-01"),
};

describe("bookmarkResolvers.Query.bookmarks", () => {
  test("requests take + 1 rows and returns a connection", async () => {
    const { context, prisma } = createMockContext();
    const rows = [
      { ...sampleBookmark, id: "b1" },
      { ...sampleBookmark, id: "b2" },
    ];

    prisma.bookmark.findMany.mockResolvedValue(rows);

    const result = await bookmarkResolvers.Query.bookmarks(
      {},
      { take: 2 },
      context
    );

    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 3,
        where: {},
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
      })
    );
    expect(result.nodes).toEqual(rows);
    expect(result.pageInfo.hasNextPage).toBe(false);
    expect(result.pageInfo.endCursor).toBe("b2");
  });

  test("sets hasNextPage and trims the extra row", async () => {
    const { context, prisma } = createMockContext();

    prisma.bookmark.findMany.mockResolvedValue([
      { ...sampleBookmark, id: "b1" },
      { ...sampleBookmark, id: "b2" },
      { ...sampleBookmark, id: "b3" },
    ]);

    const result = await bookmarkResolvers.Query.bookmarks(
      {},
      { take: 2 },
      context
    );

    expect(result.nodes).toHaveLength(2);
    expect(result.pageInfo.hasNextPage).toBe(true);
    expect(result.pageInfo.endCursor).toBe("b2");
  });

  test("passes folderId, search, and cursor to Prisma", async () => {
    const { context, prisma } = createMockContext();
    prisma.bookmark.findMany.mockResolvedValue([]);

    await bookmarkResolvers.Query.bookmarks(
      {},
      {
        folderId: "folder-1",
        search: "  prisma  ",
        take: 10,
        cursor: "bookmark-cursor",
      },
      context
    );

    expect(prisma.bookmark.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          folderId: "folder-1",
          title: {
            contains: "prisma",
            mode: "insensitive",
          },
        },
        take: 11,
        skip: 1,
        cursor: {
          id: "bookmark-cursor",
        },
      })
    );
  });

  test("rejects an invalid take value", async () => {
    const { context } = createMockContext();

    await expect(
      bookmarkResolvers.Query.bookmarks(
        {},
        { take: 0 },
        context
      )
    ).rejects.toThrow("take must be a positive integer");
  });
});

describe("bookmarkResolvers.Query.bookmark", () => {
  test("returns the bookmark when it exists", async () => {
    const { context, prisma } = createMockContext();
    prisma.bookmark.findUnique.mockResolvedValue(sampleBookmark);

    const result = await bookmarkResolvers.Query.bookmark(
      {},
      { id: "bookmark-1" },
      context
    );

    expect(result).toEqual(sampleBookmark);
  });

  test("throws NOT_FOUND when the bookmark is missing", async () => {
    const { context } = createMockContext();

    await expect(
      bookmarkResolvers.Query.bookmark(
        {},
        { id: "missing" },
        context
      )
    ).rejects.toThrow("Bookmark not found");
  });
});

describe("bookmarkResolvers.Mutation.createBookmark", () => {
  test("creates a bookmark after validating input", async () => {
    const { context, prisma } = createMockContext();
    prisma.folder.findUnique.mockResolvedValue(sampleFolder);
    prisma.bookmark.create.mockResolvedValue(sampleBookmark);

    const result = await bookmarkResolvers.Mutation.createBookmark(
      {},
      {
        title: "  Prisma Docs  ",
        url: "https://www.prisma.io/docs",
        tags: ["prisma"],
        folderId: "folder-1",
      },
      context
    );

    expect(prisma.bookmark.create).toHaveBeenCalledWith({
      data: {
        title: "Prisma Docs",
        url: "https://www.prisma.io/docs",
        tags: ["prisma"],
        folderId: "folder-1",
      },
    });
    expect(result).toEqual(sampleBookmark);
  });

  test("rejects an empty title before touching the database", async () => {
    const { context, prisma } = createMockContext();

    await expect(
      bookmarkResolvers.Mutation.createBookmark(
        {},
        {
          title: "   ",
          url: "https://example.com",
          folderId: "folder-1",
        },
        context
      )
    ).rejects.toThrow("Bookmark title cannot be empty");

    expect(prisma.folder.findUnique).not.toHaveBeenCalled();
    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });

  test("throws NOT_FOUND when the folder does not exist", async () => {
    const { context, prisma } = createMockContext();

    await expect(
      bookmarkResolvers.Mutation.createBookmark(
        {},
        {
          title: "Prisma Docs",
          url: "https://www.prisma.io/docs",
          folderId: "missing-folder",
        },
        context
      )
    ).rejects.toThrow("Folder not found");

    expect(prisma.bookmark.create).not.toHaveBeenCalled();
  });
});

describe("bookmarkResolvers.Mutation.moveBookmark", () => {
  test("moves a bookmark to another folder", async () => {
    const { context, prisma } = createMockContext();
    const moved = {
      ...sampleBookmark,
      folderId: "folder-2",
    };

    prisma.bookmark.findUnique.mockResolvedValue(sampleBookmark);
    prisma.folder.findUnique.mockResolvedValue({
      ...sampleFolder,
      id: "folder-2",
      name: "Reading",
    });
    prisma.bookmark.update.mockResolvedValue(moved);

    const result = await bookmarkResolvers.Mutation.moveBookmark(
      {},
      { id: "bookmark-1", folderId: "folder-2" },
      context
    );

    expect(prisma.bookmark.update).toHaveBeenCalledWith({
      where: { id: "bookmark-1" },
      data: { folderId: "folder-2" },
    });
    expect(result.folderId).toBe("folder-2");
  });

  test("throws when the bookmark does not exist", async () => {
    const { context, prisma } = createMockContext();

    await expect(
      bookmarkResolvers.Mutation.moveBookmark(
        {},
        { id: "missing", folderId: "folder-2" },
        context
      )
    ).rejects.toThrow("Bookmark not found");

    expect(prisma.bookmark.update).not.toHaveBeenCalled();
  });

  test("throws when the target folder does not exist", async () => {
    const { context, prisma } = createMockContext();
    prisma.bookmark.findUnique.mockResolvedValue(sampleBookmark);

    await expect(
      bookmarkResolvers.Mutation.moveBookmark(
        {},
        { id: "bookmark-1", folderId: "missing-folder" },
        context
      )
    ).rejects.toThrow("Folder not found");

    expect(prisma.bookmark.update).not.toHaveBeenCalled();
  });
});

describe("bookmarkResolvers.Mutation.deleteBookmark", () => {
  test("deletes an existing bookmark", async () => {
    const { context, prisma } = createMockContext();
    prisma.bookmark.findUnique.mockResolvedValue(sampleBookmark);

    const result = await bookmarkResolvers.Mutation.deleteBookmark(
      {},
      { id: "bookmark-1" },
      context
    );

    expect(prisma.bookmark.delete).toHaveBeenCalledWith({
      where: { id: "bookmark-1" },
    });
    expect(result).toBe(true);
  });
});
