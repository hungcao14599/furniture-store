import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/adminApi";
import { adminQueryKeys } from "./queryKeys";

export const useAdminMeQuery = (enabled: boolean) =>
  useQuery({
    queryKey: adminQueryKeys.me(),
    queryFn: adminApi.getMe,
    enabled,
  });

export const useDashboardSummaryQuery = () =>
  useQuery({
    queryKey: adminQueryKeys.dashboard(),
    queryFn: adminApi.getDashboardSummary,
  });

export const useAdminCategoriesQuery = () =>
  useQuery({
    queryKey: adminQueryKeys.categories(),
    queryFn: adminApi.getCategories,
  });

export const useAdminProductsQuery = (search = "", page = 1) =>
  useQuery({
    queryKey: adminQueryKeys.products({ search, page }),
    queryFn: () => adminApi.getProducts(search, page),
    placeholderData: keepPreviousData,
  });

export const useAdminProductByIdQuery = (id?: string) =>
  useQuery({
    queryKey: adminQueryKeys.product(id),
    queryFn: () => adminApi.getProductById(id as string),
    enabled: Boolean(id),
  });

export const useAdminPostsQuery = () =>
  useQuery({
    queryKey: adminQueryKeys.posts(),
    queryFn: adminApi.getPosts,
  });

export const useAdminPostByIdQuery = (id?: string) =>
  useQuery({
    queryKey: adminQueryKeys.post(id),
    queryFn: () => adminApi.getPostById(id as string),
    enabled: Boolean(id),
  });

export const useAdminContactInfoQuery = () =>
  useQuery({
    queryKey: adminQueryKeys.contactInfo(),
    queryFn: adminApi.getContactInfo,
  });

export const useAdminContactMessagesQuery = (filter: "all" | "handled" | "unhandled" = "all") =>
  useQuery({
    queryKey: adminQueryKeys.contactMessages(filter),
    queryFn: () => adminApi.getContactMessages(filter),
  });

export const useAdminOrdersQuery = (page = 1, status?: string) =>
  useQuery({
    queryKey: adminQueryKeys.orders({ page, status }),
    queryFn: () => adminApi.getOrders(page, status),
    placeholderData: keepPreviousData,
  });

export const useAdminOrderByIdQuery = (id?: string) =>
  useQuery({
    queryKey: adminQueryKeys.order(id),
    queryFn: () => adminApi.getOrderById(id as string),
    enabled: Boolean(id),
  });
