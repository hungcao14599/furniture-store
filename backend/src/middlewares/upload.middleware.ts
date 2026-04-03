import multer from "multer";
import { AppError } from "../utils/appError.js";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError("Chỉ chấp nhận file ảnh", 400));
      return;
    }

    callback(null, true);
  },
});
