import { ProductQuery } from "@/types/api";

const normalizeObject = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined && item !== null && item !== "")
      .sort(([left], [right]) => left.localeCompare(right)),
  );

export const publicQueryKeys = {
  all: ["public"] as const,
  home: () => ["public", "home"] as const,
  categories: () => ["public", "categories"] as const,
  productsRoot: () => ["public", "products"] as const,
  products: (query: ProductQuery = {}) =>
    ["public", "products", normalizeObject(query)] as const,
  productRoot: () => ["public", "product"] as const,
  product: (slug?: string) => ["public", "product", slug ?? ""] as const,
  posts: () => ["public", "posts"] as const,
  postRoot: () => ["public", "post"] as const,
  post: (slug?: string) => ["public", "post", slug ?? ""] as const,
  contactInfo: () => ["public", "contact-info"] as const,
};

export const adminQueryKeys = {
  all: ["admin"] as const,
  me: () => ["admin", "me"] as const,
  dashboard: () => ["admin", "dashboard"] as const,
  categories: () => ["admin", "categories"] as const,
  productsRoot: () => ["admin", "products"] as const,
  products: (params: { search?: string; page?: number } = {}) =>
    ["admin", "products", normalizeObject(params)] as const,
  productRoot: () => ["admin", "product"] as const,
  product: (id?: string) => ["admin", "product", id ?? ""] as const,
  posts: () => ["admin", "posts"] as const,
  postRoot: () => ["admin", "post"] as const,
  post: (id?: string) => ["admin", "post", id ?? ""] as const,
  contactInfo: () => ["admin", "contact-info"] as const,
  contactMessagesRoot: () => ["admin", "contact-messages"] as const,
  contactMessages: (filter: "all" | "handled" | "unhandled" = "all") =>
    ["admin", "contact-messages", filter] as const,
  ordersRoot: () => ["admin", "orders"] as const,
  orders: (params: { page?: number; status?: string } = {}) =>
    ["admin", "orders", normalizeObject(params)] as const,
  orderRoot: () => ["admin", "order"] as const,
  order: (id?: string) => ["admin", "order", id ?? ""] as const,
};
