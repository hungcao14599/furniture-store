import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { signAdminToken } from "../utils/jwt.js";

export const adminAuthService = {
  async login(email: string, password: string) {
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new AppError("Email hoặc mật khẩu không đúng", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);

    if (!isPasswordValid) {
      throw new AppError("Email hoặc mật khẩu không đúng", 401);
    }

    const token = signAdminToken({
      sub: admin.id,
      email: admin.email,
      fullName: admin.fullName,
    });

    return {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
      },
    };
  },
};
