import { AppError } from "../errors";

export const validateFirst = (first?: number): number => {
  if (first === undefined) {
    return 10;
  }

  if (!Number.isInteger(first) || first <= 0) {
    throw new AppError(
      "first must be a positive integer",
      "BAD_USER_INPUT"
    );
  }

  if (first > 100) {
    throw new AppError(
      "first cannot exceed 100",
      "BAD_USER_INPUT"
    );
  }

  return first;
};