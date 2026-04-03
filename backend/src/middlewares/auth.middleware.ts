import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { verifyAdminToken } from "../utils/jwt.js";

export const authenticateAdmin = async (request: Request, _response: Response, next: NextFunction) => {
  try {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("Bạn chưa đăng nhập", 401);
    }

    const token = authorization.replace("Bearer ", "").trim();
    const payload = verifyAdminToken(token);
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, fullName: true },
    });

    if (!admin) {
      throw new AppError("Tài khoản quản trị không còn tồn tại", 401);
    }

    request.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};
