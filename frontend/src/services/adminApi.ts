import {
  AuthPayload,
  Category,
  ContactInfo,
  ContactMessage,
  DashboardSummary,
  Order,
  OrdersPayload,
  Post,
  Product,
  ProductListPayload,
  UploadedImage,
} from "@/types/api";
import { adminHttp } from "./http";

export const adminApi = {
  async login(payload: { email: string; password: string }) {
    const response = await adminHttp.post<{ data: AuthPayload }>("/auth/login", payload);
    return response.data.data;
  },

  async getMe() {
    const response = await adminHttp.get<{ data: AuthPayload["admin"] }>("/auth/me");
    return response.data.data;
  },

  async getDashboardSummary() {
    const response = await adminHttp.get<{ data: DashboardSummary }>("/dashboard/summary");
    return response.data.data;
  },

  async getCategories() {
    const response = await adminHttp.get<{ data: Category[] }>("/categories");
    return response.data.data;
  },

  async createCategory(payload: {
    name: string;
    slug?: string;
    description?: string;
    image?: string;
  }) {
    const response = await adminHttp.post<{ data: Category }>("/categories", payload);
    return response.data.data;
  },

  async updateCategory(
    id: string,
    payload: { name: string; slug?: string; description?: string; image?: string },
  ) {
    const response = await adminHttp.put<{ data: Category }>(`/categories/${id}`, payload);
    return response.data.data;
  },

  async deleteCategory(id: string) {
    await adminHttp.delete(`/categories/${id}`);
  },

  async getProducts(search = "", page = 1) {
    const response = await adminHttp.get<{ data: ProductListPayload }>(
      `/products?search=${encodeURIComponent(search)}&page=${page}&limit=10`,
    );
    return response.data.data;
  },

  async getProductById(id: string) {
    const response = await adminHttp.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  async createProduct(payload: unknown) {
    const response = await adminHttp.post<{ data: Product }>("/products", payload);
    return response.data.data;
  },

  async updateProduct(id: string, payload: unknown) {
    const response = await adminHttp.put<{ data: Product }>(`/products/${id}`, payload);
    return response.data.data;
  },

  async deleteProduct(id: string) {
    await adminHttp.delete(`/products/${id}`);
  },

  async getPosts() {
    const response = await adminHttp.get<{ data: Post[] }>("/posts");
    return response.data.data;
  },

  async getPostById(id: string) {
    const response = await adminHttp.get<{ data: Post }>(`/posts/${id}`);
    return response.data.data;
  },

  async createPost(payload: unknown) {
    const response = await adminHttp.post<{ data: Post }>("/posts", payload);
    return response.data.data;
  },

  async updatePost(id: string, payload: unknown) {
    const response = await adminHttp.put<{ data: Post }>(`/posts/${id}`, payload);
    return response.data.data;
  },

  async deletePost(id: string) {
    await adminHttp.delete(`/posts/${id}`);
  },

  async getContactInfo() {
    const response = await adminHttp.get<{ data: ContactInfo }>("/contact-info");
    return response.data.data;
  },

  async updateContactInfo(payload: unknown) {
    const response = await adminHttp.put<{ data: ContactInfo }>("/contact-info", payload);
    return response.data.data;
  },

  async getContactMessages(filter?: "all" | "handled" | "unhandled") {
    const query =
      filter === "all" || !filter
        ? ""
        : filter === "handled"
          ? "?isHandled=true"
          : "?isHandled=false";
    const response = await adminHttp.get<{ data: ContactMessage[] }>(`/contact-messages${query}`);
    return response.data.data;
  },

  async updateContactMessageStatus(id: string, isHandled: boolean) {
    const response = await adminHttp.patch<{ data: ContactMessage }>(
      `/contact-messages/${id}/handle`,
      { isHandled },
    );
    return response.data.data;
  },

  async getOrders(page = 1, status?: string) {
    const suffix = status ? `&status=${status}` : "";
    const response = await adminHttp.get<{ data: OrdersPayload }>(
      `/orders?page=${page}&limit=10${suffix}`,
    );
    return response.data.data;
  },

  async getOrderById(id: string) {
    const response = await adminHttp.get<{ data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  async updateOrderStatus(id: string, status: string) {
    const response = await adminHttp.patch<{ data: Order }>(`/orders/${id}/status`, { status });
    return response.data.data;
  },

  async uploadImages(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const response = await adminHttp.post<{ data: UploadedImage[] }>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },
};
