import { Request, Response } from "express";
import { adminAuthService } from "../services/adminAuth.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serialize } from "../utils/serialize.js";

export const loginAdmin = asyncHandler(async (request: Request, response: Response) => {
  const { email, password } = request.body;
  const data = await adminAuthService.login(email, password);

  response.json({
    success: true,
    message: "Đăng nhập thành công",
    data: serialize(data),
  });
});

export const getCurrentAdmin = asyncHandler(async (request: Request, response: Response) => {
  response.json({
    success: true,
    data: serialize(request.admin),
  });
});
