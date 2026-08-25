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
      });
    },
  },

    Mutation: {
    createFolder: async (
      _parent: unknown,
      args: { name: string },
      context: Context
    ) => {
      return context.prisma.folder.create({
        data: {
          name: args.name,
        },
      });
    },

    updateFolder: async (
      _parent: unknown,
      args: { id: string; name: string },
      context: Context
    ) => {
      return context.prisma.folder.update({
        where: {
          id: args.id,
        },
        data: {
          name: args.name,
        },
      });
    },

    deleteFolder: async (
      _parent: unknown,
      args: { id: string },
      context: Context
    ) => {
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
        orderBy: {
          createdAt: "desc",
        },
      });
    },
  },
};