import { folderResolvers } from "./folder.resolver";

export const resolvers = {
  Query: {
    ...folderResolvers.Query,
  },

  Folder: {
    ...folderResolvers.Folder,
  },
};