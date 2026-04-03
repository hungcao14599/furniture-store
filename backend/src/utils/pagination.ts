export const getPagination = (pageInput?: string, limitInput?: string, defaultLimit = 12) => {
  const page = Math.max(Number(pageInput ?? 1) || 1, 1);
  const limit = Math.min(Math.max(Number(limitInput ?? defaultLimit) || defaultLimit, 1), 50);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
