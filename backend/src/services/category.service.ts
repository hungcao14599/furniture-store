import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { slugify } from "../utils/slugify.js";

type CategoryPayload = {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
};

export const categoryService = {
  getPublicCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  getAdminCategories() {
    return prisma.category.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  },

  async createCategory(payload: CategoryPayload) {
    return prisma.category.create({
      data: {
        name: payload.name,
        slug: slugify(payload.slug ?? payload.name),
        description: payload.description,
        image: payload.image,
      },
    });
  },

  async updateCategory(id: string, payload: CategoryPayload) {
    return prisma.category.update({
      where: { id },
      data: {
        name: payload.name,
        slug: slugify(payload.slug ?? payload.name),
        description: payload.description,
        image: payload.image,
      },
    });
  },

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new AppError("Danh mục không tồn tại", 404);
    }

    if (category._count.products > 0) {
      throw new AppError("Không thể xóa danh mục đang chứa sản phẩm", 400);
    }

    await prisma.category.delete({ where: { id } });
  },
};
