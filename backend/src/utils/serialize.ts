import { Prisma } from "@prisma/client";

export const serialize = <T>(value: T): T => {
  if (value instanceof Prisma.Decimal) {
    return Number(value.toString()) as T;
  }

  if (value instanceof Date) {
    return value.toISOString() as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serialize(item)) as T;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, entryValue]) => [key, serialize(entryValue)]);
    return Object.fromEntries(entries) as T;
  }

  return value;
};
