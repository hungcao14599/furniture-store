import { Request, Response } from "express";
import { postService } from "../services/post.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serialize } from "../utils/serialize.js";

export const getPublicPosts = asyncHandler(async (_request: Request, response: Response) => {
  const data = await postService.getPublicPosts();
  response.json({ success: true, data: serialize(data) });
});

export const getPublicPostBySlug = asyncHandler(async (request: Request, response: Response) => {
  const data = await postService.getPublicPostBySlug(String(request.params.slug));
  response.json({ success: true, data: serialize(data) });
});

export const getAdminPosts = asyncHandler(async (_request: Request, response: Response) => {
  const data = await postService.getAdminPosts();
  response.json({ success: true, data: serialize(data) });
});

export const getAdminPostById = asyncHandler(async (request: Request, response: Response) => {
  const data = await postService.getAdminPostById(String(request.params.id));
  response.json({ success: true, data: serialize(data) });
});

export const createPost = asyncHandler(async (request: Request, response: Response) => {
  const data = await postService.createPost(request.body);
  response.status(201).json({
    success: true,
    message: "Tạo bài viết thành công",
    data: serialize(data),
  });
});

export const updatePost = asyncHandler(async (request: Request, response: Response) => {
  const data = await postService.updatePost(String(request.params.id), request.body);
  response.json({
    success: true,
    message: "Cập nhật bài viết thành công",
    data: serialize(data),
  });
});

export const deletePost = asyncHandler(async (request: Request, response: Response) => {
  await postService.deletePost(String(request.params.id));
  response.json({
    success: true,
    message: "Xóa bài viết thành công",
  });
});
