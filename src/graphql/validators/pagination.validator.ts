import { AppError } from "../errors";

export const validateTake = (take?: number): number => {
  if (take === undefined) {
    return 10;
  }

  if (!Number.isInteger(take) || take <= 0) {
    throw new AppError(
      "take must be a positive integer",
      "BAD_USER_INPUT"
    );
  }

  if (take > 100) {
    throw new AppError(
      "take cannot exceed 100",
      "BAD_USER_INPUT"
    );
  }

  return take;
};
