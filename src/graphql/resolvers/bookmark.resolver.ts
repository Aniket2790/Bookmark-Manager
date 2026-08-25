import type { Context } from "../context";

export const bookmarkResolvers = {
  Query: {
    bookmarks: async (
      _parent: unknown,
      _args: unknown,
      context: Context
    ) => {
      return context.prisma.bookmark.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    },

    bookmark: async (
      _parent: unknown,
      args: { id: string },
      context: Context
    ) => {
      return context.prisma.bookmark.findUnique({
        where: {
          id: args.id,
        },
      });
    },
  },

  Bookmark: {
    folder: (
      parent: { folderId: string },
      _args: unknown,
      context: Context
    ) => {
      return context.prisma.folder.findUnique({
        where: {
          id: parent.folderId,
        },
      });
    },
  },
};