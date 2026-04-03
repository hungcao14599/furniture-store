import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

type UploadedStorageFile = {
  name: string;
  url: string;
  size: number;
  mimetype: string;
};

const sanitizeFileName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const ensureStorageConfigured = () => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new AppError(
      "Thiếu cấu hình Supabase Storage. Hãy thiết lập SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY.",
      500,
    );
  }
};

const encodeStoragePath = (value: string) => value.split("/").map(encodeURIComponent).join("/");

const buildObjectPath = (file: Express.Multer.File) => {
  const extension =
    file.originalname.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const baseName =
    sanitizeFileName(file.originalname.replace(/\.[^.]+$/, "")) || `image-${randomUUID().slice(0, 8)}`;
  const now = new Date();
  const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const folder = env.SUPABASE_STORAGE_FOLDER.trim().replace(/^\/+|\/+$/g, "");

  return [folder, datePath, `${Date.now()}-${randomUUID().slice(0, 8)}-${baseName}.${extension}`]
    .filter(Boolean)
    .join("/");
};

const uploadSingleFile = async (file: Express.Multer.File): Promise<UploadedStorageFile> => {
  ensureStorageConfigured();
  const supabaseUrl = env.SUPABASE_URL as string;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY as string;

  const objectPath = buildObjectPath(file);
  const storageEndpoint = `${supabaseUrl}/storage/v1/object/${env.SUPABASE_STORAGE_BUCKET}/${encodeStoragePath(
    objectPath,
  )}`;

  const storageResponse = await fetch(storageEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": file.mimetype,
      "x-upsert": "false",
    },
    body: file.buffer,
  });

  if (!storageResponse.ok) {
    let details: unknown;

    try {
      details = await storageResponse.json();
    } catch {
      details = await storageResponse.text();
    }

    throw new AppError("Upload Supabase Storage thất bại", storageResponse.status, details);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${env.SUPABASE_STORAGE_BUCKET}/${encodeStoragePath(
    objectPath,
  )}`;

  return {
    name: objectPath.split("/").pop() ?? file.originalname,
    url: publicUrl,
    size: file.size,
    mimetype: file.mimetype,
  };
};

export const storageService = {
  async uploadImages(files: Express.Multer.File[]) {
    if (files.length === 0) {
      throw new AppError("Không có file nào được tải lên", 400);
    }

    return Promise.all(files.map((file) => uploadSingleFile(file)));
  },
};
