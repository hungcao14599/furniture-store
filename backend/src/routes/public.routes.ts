import { Router } from "express";
import { createChatbotReply } from "../controllers/chatbot.controller.js";
import {
  createContactMessage,
  getContactInfo,
} from "../controllers/contact.controller.js";
import {
  getPublicCategories,
} from "../controllers/category.controller.js";
import { createOrder } from "../controllers/order.controller.js";
import {
  getPublicPostBySlug,
  getPublicPosts,
} from "../controllers/post.controller.js";
import {
  getProductFilterOptions,
  getPublicProductBySlug,
  getPublicProducts,
} from "../controllers/product.controller.js";
import {
  chatbotMessageSchema,
  contactMessageSchema,
  createOrderSchema,
} from "../utils/schemas.js";
import { validate } from "../middlewares/validate.middleware.js";

export const publicRouter = Router();

publicRouter.get("/categories", getPublicCategories);
publicRouter.get("/products/filter-options", getProductFilterOptions);
publicRouter.get("/products", getPublicProducts);
publicRouter.get("/products/:slug", getPublicProductBySlug);
publicRouter.get("/posts", getPublicPosts);
publicRouter.get("/posts/:slug", getPublicPostBySlug);
publicRouter.get("/contact-info", getContactInfo);
publicRouter.post("/chatbot", validate(chatbotMessageSchema), createChatbotReply);
publicRouter.post("/contact-messages", validate(contactMessageSchema), createContactMessage);
publicRouter.post("/orders", validate(createOrderSchema), createOrder);
