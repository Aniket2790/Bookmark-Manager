import { mock } from "bun:test";
import type { Context } from "../../context";

const asyncListMock = () =>
  mock((): Promise<unknown> => Promise.resolve([]));

const asyncNullMock = () =>
  mock((): Promise<unknown> => Promise.resolve(null));

export const createMockContext = () => {
  const prisma = {
    folder: {
      findMany: asyncListMock(),
      findUnique: asyncNullMock(),
      create: asyncNullMock(),
      update: asyncNullMock(),
      delete: asyncNullMock(),
    },
    bookmark: {
      findMany: asyncListMock(),
      findUnique: asyncNullMock(),
      create: asyncNullMock(),
      update: asyncNullMock(),
      delete: asyncNullMock(),
    },
  };

  return {
    prisma,
    context: { prisma } as unknown as Context,
  };
};
