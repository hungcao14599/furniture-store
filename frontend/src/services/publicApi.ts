import {
  ChatbotHistoryTurn,
  ChatbotReply,
  Category,
  ContactInfo,
  Post,
  ProductDetail,
  ProductFilterOptions,
  ProductListPayload,
  ProductQuery,
  Order,
} from "@/types/api";
import { publicHttp } from "./http";

const buildQuery = (query: ProductQuery) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    params.set(key, String(value));
  });

  return params;
};

export const publicApi = {
  async getCategories() {
    const response = await publicHttp.get<{ data: Category[] }>("/categories");
    return response.data.data;
  },

  async getProducts(query: ProductQuery = {}) {
    const response = await publicHttp.get<{ data: ProductListPayload }>(
      `/products?${buildQuery(query).toString()}`,
    );
    return response.data.data;
  },

  async getProductFilterOptions() {
    const response = await publicHttp.get<{ data: ProductFilterOptions }>("/products/filter-options");
    return response.data.data;
  },

  async getProductBySlug(slug: string) {
    const response = await publicHttp.get<{ data: ProductDetail }>(`/products/${slug}`);
    return response.data.data;
  },

  async getPosts() {
    const response = await publicHttp.get<{ data: Post[] }>("/posts");
    return response.data.data;
  },

  async getPostBySlug(slug: string) {
    const response = await publicHttp.get<{ data: Post }>(`/posts/${slug}`);
    return response.data.data;
  },

  async getContactInfo() {
    const response = await publicHttp.get<{ data: ContactInfo }>("/contact-info");
    return response.data.data;
  },

  async createChatbotReply(payload: { message: string; history: ChatbotHistoryTurn[] }) {
    const response = await publicHttp.post<{ data: ChatbotReply }>("/chatbot", payload);
    return response.data.data;
  },

  async createContactMessage(payload: {
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
  }) {
    const response = await publicHttp.post<{ data: unknown }>("/contact-messages", payload);
    return response.data;
  },

  async createOrder(payload: {
    customerName: string;
    phone: string;
    email: string;
    address: string;
    note?: string;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    const response = await publicHttp.post<{ data: Order }>("/orders", payload);
    return response.data.data;
  },
};
