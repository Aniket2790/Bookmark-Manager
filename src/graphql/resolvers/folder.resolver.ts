import type { Context } from "../context";

export const folderResolvers = {
  Query: {
    folders: async (
      _parent: unknown,
      _args: unknown,
      context: Context
    ) => {
      return context.prisma.folder.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          bookmarks: true,
        },
      });
    },

    folder: async (
      _parent: unknown,
      args: { id: string },
      context: Context
    ) => {
      return context.prisma.folder.findUnique({
        where: {
          id: args.id,
        },
        include: {
          bookmarks: true,
        },
      });
    },
  },

  Folder: {
    bookmarks: (
      parent: { id: string },
      _args: unknown,
      context: Context
    ) => {
      return context.prisma.bookmark.findMany({
        where: {
          folderId: parent.id,
        },
      });
    },
  },
};