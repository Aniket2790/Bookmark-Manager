import type { Context } from "../context";
import { AppError } from "../errors";
import { validateFolderName } from "../validators/folder.validator";

export const folderResolvers = {
  Query: {
    folders: async (
      _parent: unknown,
      _args: unknown,
      context: Context
    ) => {
      return context.prisma.folder.findMany({
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
      });
    },

    folder: async (
      _parent: unknown,
      args: { id: string },
      context: Context
    ) => {
      const folder = await context.prisma.folder.findUnique({
        where: {
          id: args.id,
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

  Mutation: {
    createFolder: async (
      _parent: unknown,
      args: { name: string },
      context: Context
    ) => {
      const name = validateFolderName(args.name);

      return context.prisma.folder.create({
        data: {
          name,
        },
      });
    },

    updateFolder: async (
      _parent: unknown,
      args: { id: string; name: string },
      context: Context
    ) => {
      const name = validateFolderName(args.name);

      const folder = await context.prisma.folder.findUnique({
        where: {
          id: args.id,
        },
      });

      if (!folder) {
        throw new AppError(
          "Folder not found",
          "NOT_FOUND"
        );
      }

      return context.prisma.folder.update({
        where: {
          id: args.id,
        },
        data: {
          name,
        },
      });
    },

    deleteFolder: async (
      _parent: unknown,
      args: { id: string },
      context: Context
    ) => {
      const folder = await context.prisma.folder.findUnique({
        where: {
          id: args.id,
        },
      });

      if (!folder) {
        throw new AppError(
          "Folder not found",
          "NOT_FOUND"
        );
      }

      await context.prisma.folder.delete({
        where: {
          id: args.id,
        },
      });

      return true;
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
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
      });
    },
  },
};