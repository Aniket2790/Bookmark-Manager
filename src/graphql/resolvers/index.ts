import { folderResolvers } from "./folder.resolver";
import { bookmarkResolvers } from "./bookmark.resolver";

export const resolvers = {
  Query: {
    ...folderResolvers.Query,
    ...bookmarkResolvers.Query,
  },

  Folder: {
    ...folderResolvers.Folder,
  },

  Bookmark: {
    ...bookmarkResolvers.Bookmark,
  },
};