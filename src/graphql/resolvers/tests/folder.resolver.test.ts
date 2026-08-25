import { describe, expect, test } from "bun:test";
import { folderResolvers } from "../folder.resolver";
import { createMockContext } from "./mock-context";

const sampleFolder = {
  id: "folder-1",
  name: "Development",
  createdAt: new Date("2026-01-01"),
};

describe("folderResolvers.Query.folders", () => {
  test("returns folders ordered by newest first", async () => {
    const { context, prisma } = createMockContext();
    prisma.folder.findMany.mockResolvedValue([sampleFolder]);

    const result = await folderResolvers.Query.folders(
      {},
      {},
      context
    );

    expect(prisma.folder.findMany).toHaveBeenCalledWith({
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
    });
    expect(result).toEqual([sampleFolder]);
  });
});

describe("folderResolvers.Query.folder", () => {
  test("returns a folder when it exists", async () => {
    const { context, prisma } = createMockContext();
    prisma.folder.findUnique.mockResolvedValue(sampleFolder);

    const result = await folderResolvers.Query.folder(
      {},
      { id: "folder-1" },
      context
    );

    expect(result).toEqual(sampleFolder);
  });

  test("throws NOT_FOUND when the folder is missing", async () => {
    const { context } = createMockContext();

    await expect(
      folderResolvers.Query.folder(
        {},
        { id: "missing" },
        context
      )
    ).rejects.toThrow("Folder not found");
  });
});

describe("folderResolvers.Mutation.createFolder", () => {
  test("creates a folder with a trimmed name", async () => {
    const { context, prisma } = createMockContext();
    prisma.folder.create.mockResolvedValue(sampleFolder);

    const result = await folderResolvers.Mutation.createFolder(
      {},
      { name: "  Development  " },
      context
    );

    expect(prisma.folder.create).toHaveBeenCalledWith({
      data: { name: "Development" },
    });
    expect(result).toEqual(sampleFolder);
  });

  test("rejects an empty folder name", async () => {
    const { context, prisma } = createMockContext();

    await expect(
      folderResolvers.Mutation.createFolder(
        {},
        { name: "   " },
        context
      )
    ).rejects.toThrow("Folder name cannot be empty");

    expect(prisma.folder.create).not.toHaveBeenCalled();
  });
});

describe("folderResolvers.Folder.bookmarks", () => {
  test("loads bookmarks for the parent folder", async () => {
    const { context, prisma } = createMockContext();
    const bookmarks = [
      {
        id: "bookmark-1",
        title: "Prisma Docs",
        url: "https://www.prisma.io/docs",
        tags: ["prisma"],
        folderId: "folder-1",
        createdAt: new Date("2026-01-01"),
      },
    ];

    prisma.bookmark.findMany.mockResolvedValue(bookmarks);

    const result = await folderResolvers.Folder.bookmarks(
      { id: "folder-1" },
      {},
      context
    );

    expect(prisma.bookmark.findMany).toHaveBeenCalledWith({
      where: { folderId: "folder-1" },
      orderBy: [
        { createdAt: "desc" },
        { id: "desc" },
      ],
    });
    expect(result).toEqual(bookmarks);
  });
});
