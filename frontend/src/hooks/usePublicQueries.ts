import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { publicApi } from "@/services/publicApi";
import { ProductQuery } from "@/types/api";
import { publicQueryKeys } from "./queryKeys";

export const useHomePageQuery = () =>
  useQuery({
    queryKey: publicQueryKeys.home(),
    queryFn: async () => {
      const [
        categories,
        featuredProducts,
        bestSellerProducts,
        latestProducts,
        posts,
        contactInfo,
      ] = await Promise.all([
        publicApi.getCategories(),
        publicApi.getProducts({ limit: 4, featured: true, sort: "featured" }),
        publicApi.getProducts({ limit: 4, bestSeller: true }),
        publicApi.getProducts({ limit: 4, isNew: true }),
        publicApi.getPosts(),
        publicApi.getContactInfo(),
      ]);

      return {
        categories,
        featuredProducts: featuredProducts.items,
        bestSellerProducts: bestSellerProducts.items,
        latestProducts: latestProducts.items,
        posts: posts.slice(0, 3),
        contactInfo,
      };
    },
  });

export const useCategoriesQuery = () =>
  useQuery({
    queryKey: publicQueryKeys.categories(),
    queryFn: publicApi.getCategories,
  });

export const useProductsQuery = (query: ProductQuery) =>
  useQuery({
    queryKey: publicQueryKeys.products(query),
    queryFn: () => publicApi.getProducts(query),
    placeholderData: keepPreviousData,
  });

export const useProductBySlugQuery = (slug?: string) =>
  useQuery({
    queryKey: publicQueryKeys.product(slug),
    queryFn: () => publicApi.getProductBySlug(slug as string),
    enabled: Boolean(slug),
  });

export const usePostsQuery = () =>
  useQuery({
    queryKey: publicQueryKeys.posts(),
    queryFn: publicApi.getPosts,
  });

export const usePostBySlugQuery = (slug?: string) =>
  useQuery({
    queryKey: publicQueryKeys.post(slug),
    queryFn: () => publicApi.getPostBySlug(slug as string),
    enabled: Boolean(slug),
  });

export const useContactInfoQuery = () =>
  useQuery({
    queryKey: publicQueryKeys.contactInfo(),
    queryFn: publicApi.getContactInfo,
  });
