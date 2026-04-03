import { Request, Response } from "express";
import { categoryService } from "../services/category.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serialize } from "../utils/serialize.js";

export const getPublicCategories = asyncHandler(async (_request: Request, response: Response) => {
  const data = await categoryService.getPublicCategories();
  response.json({ success: true, data: serialize(data) });
});

export const getAdminCategories = asyncHandler(async (_request: Request, response: Response) => {
  const data = await categoryService.getAdminCategories();
  response.json({ success: true, data: serialize(data) });
});

export const createCategory = asyncHandler(async (request: Request, response: Response) => {
  const data = await categoryService.createCategory(request.body);
  response.status(201).json({
    success: true,
    message: "Tạo danh mục thành công",
    data: serialize(data),
  });
});

export const updateCategory = asyncHandler(async (request: Request, response: Response) => {
  const data = await categoryService.updateCategory(String(request.params.id), request.body);
  response.json({
    success: true,
    message: "Cập nhật danh mục thành công",
    data: serialize(data),
  });
});

export const deleteCategory = asyncHandler(async (request: Request, response: Response) => {
  await categoryService.deleteCategory(String(request.params.id));
  response.json({
    success: true,
    message: "Xóa danh mục thành công",
  });
});
