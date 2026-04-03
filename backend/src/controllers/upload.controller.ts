import { Request, Response } from "express";
import { storageService } from "../services/storage.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadImages = asyncHandler(async (request: Request, response: Response) => {
  const files = (request.files as Express.Multer.File[]) ?? [];
  const data = await storageService.uploadImages(files);

  response.status(201).json({
    success: true,
    message: "Upload ảnh thành công",
    data,
  });
});
