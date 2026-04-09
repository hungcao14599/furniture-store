import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { getPagination } from "../utils/pagination.js";
import { slugify } from "../utils/slugify.js";
import { productEmbeddingService } from "./productEmbedding.service.js";

type ProductImageInput = {
  url: string;
  altText?: string;
  sortOrder?: number;
};

type ProductPayload = {
  name: string;
  slug?: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  material: string;
  color: string;
  dimensions: string;
  specifications: Record<string, string>;
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  categoryId: string;
  images: ProductImageInput[];
};

export const productInclude = {
  category: true,
  images: {
    orderBy: {
      sortOrder: "asc",
    },
  },
} satisfies Prisma.ProductInclude;

const buildSort = (sort?: string): Prisma.ProductOrderByWithRelationInput[] => {
  if (sort === "price_asc") {
    return [{ price: "asc" }];
  }

  if (sort === "price_desc") {
    return [{ price: "desc" }];
  }

  if (sort === "featured") {
    return [{ featured: "desc" }, { bestSeller: "desc" }, { createdAt: "desc" }];
  }

  return [{ createdAt: "desc" }];
};

const logEmbeddingSyncError = (productId: string, error: unknown) => {
  console.error(`[vector-search] sync failed for product ${productId}`, error);
};

export const productService = {
  async getFilterOptions() {
    const [materials, colors, priceRange] = await Promise.all([
      prisma.product.findMany({
        distinct: ["material"],
        select: { material: true },
        orderBy: { material: "asc" },
      }),
      prisma.product.findMany({
        distinct: ["color"],
        select: { color: true },
        orderBy: { color: "asc" },
      }),
      prisma.product.aggregate({
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return {
      materials: materials.map((item) => item.material),
      colors: colors.map((item) => item.color),
      priceRange: {
        min: priceRange._min.price ?? new Prisma.Decimal(0),
        max: priceRange._max.price ?? new Prisma.Decimal(0),
      },
    };
  },

  async getPublicProducts(query: Record<string, string | undefined>) {
    const { page, limit, skip } = getPagination(query.page, query.limit);
    const search = query.search?.trim();

    const where: Prisma.ProductWhereInput = {
      category: query.category ? { slug: query.category } : undefined,
      material: query.material || undefined,
      color: query.color || undefined,
      featured: query.featured ? query.featured === "true" : undefined,
      bestSeller: query.bestSeller ? query.bestSeller === "true" : undefined,
      isNew: query.isNew ? query.isNew === "true" : undefined,
      price: {
        gte: query.minPrice ? Number(query.minPrice) : undefined,
        lte: query.maxPrice ? Number(query.maxPrice) : undefined,
      },
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { shortDescription: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { material: { contains: search, mode: "insensitive" } },
            { color: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: buildSort(query.sort),
        include: productInclude,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getPublicProductsByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: ids },
      },
      include: productInclude,
    });

    const productMap = new Map(products.map((product) => [product.id, product]));

    return ids.map((id) => productMap.get(id)).filter((product): product is (typeof products)[number] => Boolean(product));
  },

  async getPublicProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });

    if (!product) {
      throw new AppError("Sản phẩm không tồn tại", 404);
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        categoryId: product.categoryId,
      },
      take: 4,
      orderBy: [{ bestSeller: "desc" }, { createdAt: "desc" }],
      include: productInclude,
    });

    return {
      ...product,
      relatedProducts,
    };
  },

  async getAdminProducts(query: Record<string, string | undefined>) {
    const { page, limit, skip } = getPagination(query.page, query.limit, 10);
    const search = query.search?.trim();

    const where: Prisma.ProductWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: productInclude,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getAdminProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new AppError("Sản phẩm không tồn tại", 404);
    }

    return product;
  },

  async createProduct(payload: ProductPayload) {
    const category = await prisma.category.findUnique({
      where: { id: payload.categoryId },
      select: { id: true },
    });

    if (!category) {
      throw new AppError("Danh mục không tồn tại", 400);
    }

    const product = await prisma.product.create({
      data: {
        name: payload.name,
        slug: slugify(payload.slug ?? payload.name),
        sku: payload.sku,
        shortDescription: payload.shortDescription,
        description: payload.description,
        price: new Prisma.Decimal(payload.price),
        material: payload.material,
        color: payload.color,
        dimensions: payload.dimensions,
        specifications: payload.specifications,
        stock: payload.stock,
        featured: payload.featured,
        bestSeller: payload.bestSeller,
        isNew: payload.isNew,
        categoryId: payload.categoryId,
        images: {
          create: payload.images.map((image, index) => ({
            url: image.url,
            altText: image.altText,
            sortOrder: image.sortOrder ?? index,
          })),
        },
      },
      include: productInclude,
    });

    await productEmbeddingService.syncProductEmbedding(product.id).catch((error) => logEmbeddingSyncError(product.id, error));

    return product;
  },

  async updateProduct(id: string, payload: ProductPayload) {
    const [existingProduct, category] = await Promise.all([
      prisma.product.findUnique({
        where: { id },
        select: { id: true },
      }),
      prisma.category.findUnique({
        where: { id: payload.categoryId },
        select: { id: true },
      }),
    ]);

    if (!existingProduct) {
      throw new AppError("Sản phẩm không tồn tại", 404);
    }

    if (!category) {
      throw new AppError("Danh mục không tồn tại", 400);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: payload.name,
        slug: slugify(payload.slug ?? payload.name),
        sku: payload.sku,
        shortDescription: payload.shortDescription,
        description: payload.description,
        price: new Prisma.Decimal(payload.price),
        material: payload.material,
        color: payload.color,
        dimensions: payload.dimensions,
        specifications: payload.specifications,
        stock: payload.stock,
        featured: payload.featured,
        bestSeller: payload.bestSeller,
        isNew: payload.isNew,
        categoryId: payload.categoryId,
        images: {
          deleteMany: {},
          create: payload.images.map((image, index) => ({
            url: image.url,
            altText: image.altText,
            sortOrder: image.sortOrder ?? index,
          })),
        },
      },
      include: productInclude,
    });

    await productEmbeddingService.syncProductEmbedding(product.id).catch((error) => logEmbeddingSyncError(product.id, error));

    return product;
  },

  async deleteProduct(id: string) {
    await prisma.product.delete({
      where: { id },
    });
  },
};
