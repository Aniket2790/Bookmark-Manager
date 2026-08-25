import type { Context } from "../context";
import { AppError } from "../errors";
import {
  validateBookmarkTags,
  validateBookmarkTitle,
  validateBookmarkUrl,
} from "../validators/bookmark.validator";
import { validateFirst } from "../validators/pagination.validator";

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
      const first = validateFirst(args.first);

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