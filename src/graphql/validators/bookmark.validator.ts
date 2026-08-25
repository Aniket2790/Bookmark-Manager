import { AppError } from "../errors";

export const validateBookmarkTitle = (title: string): string => {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new AppError(
      "Bookmark title cannot be empty",
      "BAD_USER_INPUT"
    );
  }

  if (trimmedTitle.length > 200) {
    throw new AppError(
      "Bookmark title cannot exceed 200 characters",
      "BAD_USER_INPUT"
    );
  }

  return trimmedTitle;
};

export const validateBookmarkUrl = (url: string): string => {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    throw new AppError(
      "Bookmark URL cannot be empty",
      "BAD_USER_INPUT"
    );
  }

  try {
    const parsedUrl = new URL(trimmedUrl);

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error();
    }
  } catch {
    throw new AppError(
      "Bookmark URL must be a valid HTTP or HTTPS URL",
      "BAD_USER_INPUT"
    );
  }

  return trimmedUrl;
};

export const validateBookmarkTags = (
  tags?: string[]
): string[] => {
  if (!tags) {
    return [];
  }

  const cleanedTags = tags
    .map((tag) => tag.trim())
    .filter(Boolean);

  if (cleanedTags.length > 20) {
    throw new AppError(
      "A bookmark cannot have more than 20 tags",
      "BAD_USER_INPUT"
    );
  }

  return cleanedTags;
};