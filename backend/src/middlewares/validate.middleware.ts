import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/appError.js";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  <T>(schema: ZodSchema<T>, target: ValidationTarget = "body") =>
  (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request[target]);

    if (!result.success) {
      return next(new AppError("Dữ liệu gửi lên không hợp lệ", 400, result.error.flatten()));
    }

    request[target] = result.data as never;
    return next();
  };
