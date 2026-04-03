import { Router } from "express";
import {
  getCurrentAdmin,
  loginAdmin,
} from "../controllers/adminAuth.controller.js";
import {
  createCategory,
  deleteCategory,
  getAdminCategories,
  updateCategory,
} from "../controllers/category.controller.js";
import {
  getContactMessages,
  getContactInfo,
  updateContactInfo,
  updateContactMessageStatus,
} from "../controllers/contact.controller.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
import {
  getOrderById,
  getOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import {
  createPost,
  deletePost,
  getAdminPostById,
  getAdminPosts,
  updatePost,
} from "../controllers/post.controller.js";
import {
  createProduct,
  deleteProduct,
  getAdminProductById,
  getAdminProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { uploadImages } from "../controllers/upload.controller.js";
import { authenticateAdmin } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  categorySchema,
  contactInfoSchema,
  loginSchema,
  postSchema,
  productSchema,
  toggleContactMessageSchema,
  updateOrderStatusSchema,
} from "../utils/schemas.js";

export const adminRouter = Router();

adminRouter.post("/auth/login", validate(loginSchema), loginAdmin);

adminRouter.use(authenticateAdmin);

adminRouter.get("/auth/me", getCurrentAdmin);
adminRouter.get("/dashboard/summary", getDashboardSummary);

adminRouter.get("/categories", getAdminCategories);
adminRouter.post("/categories", validate(categorySchema), createCategory);
adminRouter.put("/categories/:id", validate(categorySchema), updateCategory);
adminRouter.delete("/categories/:id", deleteCategory);

adminRouter.get("/products", getAdminProducts);
adminRouter.get("/products/:id", getAdminProductById);
adminRouter.post("/products", validate(productSchema), createProduct);
adminRouter.put("/products/:id", validate(productSchema), updateProduct);
adminRouter.delete("/products/:id", deleteProduct);

adminRouter.get("/posts", getAdminPosts);
adminRouter.get("/posts/:id", getAdminPostById);
adminRouter.post("/posts", validate(postSchema), createPost);
adminRouter.put("/posts/:id", validate(postSchema), updatePost);
adminRouter.delete("/posts/:id", deletePost);

adminRouter.get("/contact-info", getContactInfo);
adminRouter.put("/contact-info", validate(contactInfoSchema), updateContactInfo);

adminRouter.get("/contact-messages", getContactMessages);
adminRouter.patch(
  "/contact-messages/:id/handle",
  validate(toggleContactMessageSchema),
  updateContactMessageStatus,
);

adminRouter.get("/orders", getOrders);
adminRouter.get("/orders/:id", getOrderById);
adminRouter.patch("/orders/:id/status", validate(updateOrderStatusSchema), updateOrderStatus);

adminRouter.post("/uploads", upload.array("images", 10), uploadImages);
