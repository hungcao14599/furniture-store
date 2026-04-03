import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { slugify } from "../utils/slugify.js";

type PostPayload = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  isPublished: boolean;
};

export const postService = {
  getPublicPosts() {
    return prisma.post.findMany({
      where: {
        isPublished: true,
      },
      orderBy: { publishedAt: "desc" },
    });
  },

  async getPublicPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { slug },
    });

    if (!post || !post.isPublished) {
      throw new AppError("Bài viết không tồn tại", 404);
    }

    return post;
  },

  getAdminPosts() {
    return prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
    });
  },

  async getAdminPostById(id: string) {
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new AppError("Bài viết không tồn tại", 404);
    }

    return post;
  },

  createPost(payload: PostPayload) {
    const publishedAt = payload.isPublished ? new Date() : null;

    return prisma.post.create({
      data: {
        title: payload.title,
        slug: slugify(payload.slug ?? payload.title),
        excerpt: payload.excerpt,
        content: payload.content,
        coverImage: payload.coverImage,
        authorName: payload.authorName,
        isPublished: payload.isPublished,
        publishedAt,
      },
    });
  },

  async updatePost(id: string, payload: PostPayload) {
    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, publishedAt: true },
    });

    if (!existing) {
      throw new AppError("Bài viết không tồn tại", 404);
    }

    return prisma.post.update({
      where: { id },
      data: {
        title: payload.title,
        slug: slugify(payload.slug ?? payload.title),
        excerpt: payload.excerpt,
        content: payload.content,
        coverImage: payload.coverImage,
        authorName: payload.authorName,
        isPublished: payload.isPublished,
        publishedAt: payload.isPublished ? existing.publishedAt ?? new Date() : null,
      },
    });
  },

  deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  },
};
