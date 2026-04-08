import { z } from "zod";
import { ORDER_STATUS_VALUES } from "../constants/order.js";

const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }

    return value;
  }, schema.optional());

const booleanLike = z
  .union([z.boolean(), z.string(), z.number()])
  .transform((value) => value === true || value === "true" || value === 1 || value === "1");

const imagePathSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.startsWith("/uploads/") || /^https?:\/\//.test(value),
    "Ảnh phải là URL hợp lệ hoặc đường dẫn upload nội bộ",
  );

export const loginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Tên danh mục tối thiểu 2 ký tự"),
  slug: emptyToUndefined(z.string().trim().min(2)),
  description: emptyToUndefined(z.string().trim().min(10)),
  image: emptyToUndefined(imagePathSchema),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Tên sản phẩm tối thiểu 2 ký tự"),
  slug: emptyToUndefined(z.string().trim().min(2)),
  sku: z.string().trim().min(3, "SKU tối thiểu 3 ký tự"),
  shortDescription: z.string().trim().min(20, "Mô tả ngắn tối thiểu 20 ký tự"),
  description: z.string().trim().min(50, "Mô tả chi tiết tối thiểu 50 ký tự"),
  price: z.coerce.number().positive("Giá phải lớn hơn 0"),
  material: z.string().trim().min(2, "Chất liệu tối thiểu 2 ký tự"),
  color: z.string().trim().min(2, "Màu sắc tối thiểu 2 ký tự"),
  dimensions: z.string().trim().min(2, "Kích thước tối thiểu 2 ký tự"),
  specifications: z
    .record(z.string().trim().min(1), z.string().trim().min(1))
    .refine((value) => Object.keys(value).length > 0, "Cần ít nhất một thông số kỹ thuật"),
  stock: z.coerce.number().int().min(0, "Tồn kho không hợp lệ"),
  featured: booleanLike.default(false),
  bestSeller: booleanLike.default(false),
  isNew: booleanLike.default(true),
  categoryId: z.string().trim().min(1, "Danh mục là bắt buộc"),
  images: z
    .array(
      z.object({
        url: imagePathSchema,
        altText: emptyToUndefined(z.string().trim().min(2)),
        sortOrder: z.coerce.number().int().min(0).optional(),
      }),
    )
    .min(1, "Cần ít nhất một ảnh"),
});

export const postSchema = z.object({
  title: z.string().trim().min(6, "Tiêu đề tối thiểu 6 ký tự"),
  slug: emptyToUndefined(z.string().trim().min(2)),
  excerpt: z.string().trim().min(20, "Tóm tắt tối thiểu 20 ký tự"),
  content: z.string().trim().min(80, "Nội dung tối thiểu 80 ký tự"),
  coverImage: imagePathSchema,
  authorName: z.string().trim().min(2, "Tên tác giả tối thiểu 2 ký tự"),
  isPublished: booleanLike.default(true),
});

export const contactInfoSchema = z.object({
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().trim().email("Email không hợp lệ"),
  address: z.string().trim().min(10, "Địa chỉ tối thiểu 10 ký tự"),
  facebook: emptyToUndefined(z.string().trim().url("Facebook URL không hợp lệ")),
  zalo: emptyToUndefined(z.string().trim().url("Zalo URL không hợp lệ")),
  instagram: emptyToUndefined(z.string().trim().url("Instagram URL không hợp lệ")),
  mapEmbedUrl: emptyToUndefined(z.string().trim().url("Map URL không hợp lệ")),
  workingHours: z.string().trim().min(5, "Giờ làm việc tối thiểu 5 ký tự"),
  introText: emptyToUndefined(z.string().trim().min(10)),
});

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().trim().email("Email không hợp lệ"),
  subject: z.string().trim().min(4, "Tiêu đề tối thiểu 4 ký tự"),
  message: z.string().trim().min(10, "Nội dung tối thiểu 10 ký tự"),
});

export const chatbotMessageSchema = z.object({
  message: z.string().trim().min(1, "Tin nhắn không được để trống").max(1500, "Tin nhắn quá dài"),
  history: z
    .array(
      z.object({
        role: z.enum(["assistant", "user"]),
        text: z.string().trim().min(1).max(1500),
      }),
    )
    .max(12)
    .default([]),
});

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Họ tên tối thiểu 2 ký tự"),
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ"),
  email: z.string().trim().email("Email không hợp lệ"),
  address: z.string().trim().min(10, "Địa chỉ tối thiểu 10 ký tự"),
  note: emptyToUndefined(z.string().trim().max(500)),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1).max(10),
      }),
    )
    .min(1, "Giỏ hàng đang trống"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
});

export const toggleContactMessageSchema = z.object({
  isHandled: booleanLike.default(true),
});
