import { Request, Response } from "express";
import { productService } from "../services/product.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serialize } from "../utils/serialize.js";

export const getProductFilterOptions = asyncHandler(async (_request: Request, response: Response) => {
  const data = await productService.getFilterOptions();
  response.json({ success: true, data: serialize(data) });
});

export const getPublicProducts = asyncHandler(async (request: Request, response: Response) => {
  const data = await productService.getPublicProducts(request.query as Record<string, string | undefined>);
  response.json({ success: true, data: serialize(data) });
});

export const getPublicProductBySlug = asyncHandler(async (request: Request, response: Response) => {
  const data = await productService.getPublicProductBySlug(String(request.params.slug));
  response.json({ success: true, data: serialize(data) });
});

export const getAdminProducts = asyncHandler(async (request: Request, response: Response) => {
  const data = await productService.getAdminProducts(request.query as Record<string, string | undefined>);
  response.json({ success: true, data: serialize(data) });
});

export const getAdminProductById = asyncHandler(async (request: Request, response: Response) => {
  const data = await productService.getAdminProductById(String(request.params.id));
  response.json({ success: true, data: serialize(data) });
});

export const createProduct = asyncHandler(async (request: Request, response: Response) => {
  const data = await productService.createProduct(request.body);
  response.status(201).json({
    success: true,
    message: "Tạo sản phẩm thành công",
    data: serialize(data),
  });
});

export const updateProduct = asyncHandler(async (request: Request, response: Response) => {
  const data = await productService.updateProduct(String(request.params.id), request.body);
  response.json({
    success: true,
    message: "Cập nhật sản phẩm thành công",
    data: serialize(data),
  });
});

export const deleteProduct = asyncHandler(async (request: Request, response: Response) => {
  await productService.deleteProduct(String(request.params.id));
  response.json({
    success: true,
    message: "Xóa sản phẩm thành công",
  });
});
