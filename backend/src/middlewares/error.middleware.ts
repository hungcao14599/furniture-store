import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/appError.js";

export const notFoundHandler = (_request: Request, _response: Response, next: NextFunction) => {
  next(new AppError("Không tìm thấy tài nguyên", 404));
};

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  if (error instanceof ZodError) {
    return response.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      details: error.flatten(),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return response.status(409).json({
        success: false,
        message: "Dữ liệu bị trùng với bản ghi đã tồn tại",
        details: error.meta,
      });
    }

    if (error.code === "P2025") {
      return response.status(404).json({
        success: false,
        message: "Bản ghi không tồn tại",
      });
    }
  }

  console.error(error);

  return response.status(500).json({
    success: false,
    message: "Đã xảy ra lỗi máy chủ",
  });
};
