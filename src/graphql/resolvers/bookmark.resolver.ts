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

   Mutation: {
    createBookmark: async (
      _parent: unknown,
      args: {
        title: string;
        url: string;
        tags?: string[];
        folderId: string;
      },
      context: Context
    ) => {
      return context.prisma.bookmark.create({
        data: {
          title: args.title,
          url: args.url,
          tags: args.tags ?? [],
          folderId: args.folderId,
        },
      });
    },

    updateBookmark: async (
      _parent: unknown,
      args: {
        id: string;
        title?: string;
        url?: string;
        tags?: string[];
        folderId?: string;
      },
      context: Context
    ) => {
      return context.prisma.bookmark.update({
        where: {
          id: args.id,
        },
        data: {
          ...(args.title !== undefined && {
            title: args.title,
          }),

          ...(args.url !== undefined && {
            url: args.url,
          }),

          ...(args.tags !== undefined && {
            tags: args.tags,
          }),

          ...(args.folderId !== undefined && {
            folderId: args.folderId,
          }),
        },
      });
    },

    deleteBookmark: async (
      _parent: unknown,
      args: { id: string },
      context: Context
    ) => {
      await context.prisma.bookmark.delete({
        where: {
          id: args.id,
        },
      });

      return true;
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