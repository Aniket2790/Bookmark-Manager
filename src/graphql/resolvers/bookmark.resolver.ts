import type { Context } from "../context";

export const bookmarkResolvers = {
  Query: {
    bookmarks: async (
      _parent: unknown,
      args: {
        first?: number;
        after?: string;
      },
      context: Context
    ) => {
      const first = args.first ?? 10;

      const bookmarks = await context.prisma.bookmark.findMany({
        take: first + 1,

        ...(args.after
          ? {
              cursor: {
                id: args.after,
              },
              skip: 1,
            }
          : {}),

        orderBy: {
          createdAt: "desc",
        },
      });

      const hasNextPage = bookmarks.length > first;

      const nodes = hasNextPage
        ? bookmarks.slice(0, first)
        : bookmarks;

  const endCursor = nodes.at(-1)?.id ?? null;

      return {
        nodes,
        pageInfo: {
          hasNextPage,
          endCursor,
        },
      };
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