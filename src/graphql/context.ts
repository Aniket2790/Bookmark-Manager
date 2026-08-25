import prisma from "../lib/prisma";

export type Context = {
  prisma: typeof prisma;
};

export const createContext = (): Context => ({
  prisma,
});