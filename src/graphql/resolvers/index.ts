import { folderResolvers } from "./folder.resolver";
import { bookmarkResolvers } from "./bookmark.resolver";

export const resolvers = {
  Query: {
    ...folderResolvers.Query,
    ...bookmarkResolvers.Query,
  },
   Mutation: {
    ...folderResolvers.Mutation,
    ...bookmarkResolvers.Mutation,
  },

  Folder: {
    ...folderResolvers.Folder,
  },

  Bookmark: {
    ...bookmarkResolvers.Bookmark,
  },
};