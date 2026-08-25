import { AppError } from "../errors";

export const validateFolderName = (name: string): string => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    throw new AppError(
      "Folder name cannot be empty",
      "BAD_USER_INPUT"
    );
  }

  if (trimmedName.length > 100) {
    throw new AppError(
      "Folder name cannot exceed 100 characters",
      "BAD_USER_INPUT"
    );
  }

  return trimmedName;
};