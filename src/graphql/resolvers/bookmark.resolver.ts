import type { Context } from "../context";
import { AppError } from "../errors";
import {
  validateBookmarkTags,
  validateBookmarkTitle,
  validateBookmarkUrl,
} from "../validators/bookmark.validator";
import { validateTake } from "../validators/pagination.validator";

const bookmarkListOrderBy = [
  { createdAt: "desc" as const },
  { id: "desc" as const },
];

const buildBookmarkWhere = (args: {
  folderId?: string;
  search?: string;
}) => {
  const where: {
    folderId?: string;
    title?: {
      contains: string;
      mode: "insensitive";
    };
  } = {};

  if (args.folderId) {
    where.folderId = args.folderId;
  }

  const search = args.search?.trim();

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  return where;
};

export const bookmarkResolvers = {
  Query: {
    bookmarks: async (
      _parent: unknown,
      args: {
        folderId?: string;
        search?: string;
        take?: number;
        cursor?: string;
      },
      context: Context
    ) => {
      const take = validateTake(args.take);

      const bookmarks = await context.prisma.bookmark.findMany({
        where: buildBookmarkWhere(args),
        take: take + 1,
        ...(args.cursor
          ? {
              cursor: {
                id: args.cursor,
              },
              skip: 1,
            }
          : {}),
        orderBy: bookmarkListOrderBy,
      });

      const hasNextPage = bookmarks.length > take;

      const nodes = hasNextPage
        ? bookmarks.slice(0, take)
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
      const bookmark = await context.prisma.bookmark.findUnique({
        where: {
          id: args.id,
        },
      });

      if (!bookmark) {
        throw new AppError(
          "Bookmark not found",
          "NOT_FOUND"
        );
      }

      return bookmark;
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
      const title = validateBookmarkTitle(args.title);
      const url = validateBookmarkUrl(args.url);
      const tags = validateBookmarkTags(args.tags);

      const folder = await context.prisma.folder.findUnique({
        where: {
          id: args.folderId,
        },
      });

      if (!folder) {
        throw new AppError(
          "Folder not found",
          "NOT_FOUND"
        );
      }

      return context.prisma.bookmark.create({
        data: {
          title,
          url,
          tags,
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
      const bookmark = await context.prisma.bookmark.findUnique({
        where: {
          id: args.id,
        },
      });

      if (!bookmark) {
        throw new AppError(
          "Bookmark not found",
          "NOT_FOUND"
        );
      }

      const data: {
        title?: string;
        url?: string;
        tags?: string[];
        folderId?: string;
      } = {};

      if (args.title !== undefined) {
        data.title = validateBookmarkTitle(args.title);
      }

      if (args.url !== undefined) {
        data.url = validateBookmarkUrl(args.url);
      }

      if (args.tags !== undefined) {
        data.tags = validateBookmarkTags(args.tags);
      }

      if (args.folderId !== undefined) {
        const folder = await context.prisma.folder.findUnique({
          where: {
            id: args.folderId,
          },
        });

        if (!folder) {
          throw new AppError(
            "Folder not found",
            "NOT_FOUND"
          );
        }

        data.folderId = args.folderId;
      }

      return context.prisma.bookmark.update({
        where: {
          id: args.id,
        },
        data,
      });
    },

    deleteBookmark: async (
      _parent: unknown,
      args: { id: string },
      context: Context
    ) => {
      const bookmark = await context.prisma.bookmark.findUnique({
        where: {
          id: args.id,
        },
      });

      if (!bookmark) {
        throw new AppError(
          "Bookmark not found",
          "NOT_FOUND"
        );
      }

      await context.prisma.bookmark.delete({
        where: {
          id: args.id,
        },
      });

      return true;
    },

    moveBookmark: async (
      _parent: unknown,
      args: { id: string; folderId: string },
      context: Context
    ) => {
      const bookmark = await context.prisma.bookmark.findUnique({
        where: {
          id: args.id,
        },
      });

      if (!bookmark) {
        throw new AppError(
          "Bookmark not found",
          "NOT_FOUND"
        );
      }

      const folder = await context.prisma.folder.findUnique({
        where: {
          id: args.folderId,
        },
      });

      if (!folder) {
        throw new AppError(
          "Folder not found",
          "NOT_FOUND"
        );
      }

      return context.prisma.bookmark.update({
        where: {
          id: args.id,
        },
        data: {
          folderId: args.folderId,
        },
      });
    },
  },

  Bookmark: {
    folder: async (
      parent: { folderId: string },
      _args: unknown,
      context: Context
    ) => {
      const folder = await context.prisma.folder.findUnique({
        where: {
          id: parent.folderId,
        },
      });

      if (!folder) {
        throw new AppError(
          "Folder not found",
          "NOT_FOUND"
        );
      }

      return folder;
    },
  },
};
