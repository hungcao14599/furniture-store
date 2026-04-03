import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./appError.js";

type TokenPayload = {
  sub: string;
  email: string;
  fullName: string;
};

export const signAdminToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

export const verifyAdminToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    throw new AppError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn", 401);
  }
};
