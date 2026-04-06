import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export type ApiError = Error & {
  details?: unknown;
};

const normalizeError = (error: unknown): ApiError => {
  let message = "Đã xảy ra lỗi không xác định";
  let details: unknown;

  if (axios.isAxiosError(error)) {
    message = error.response?.data?.message ?? error.message ?? "Đã xảy ra lỗi";
    details = error.response?.data?.details;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const normalized = new Error(message) as ApiError;
  normalized.details = details;
  return normalized;
};

const defaultApiUrl = import.meta.env.PROD ? "/api" : "http://localhost:5000/api";
const apiUrl = (import.meta.env.VITE_API_URL?.trim() || defaultApiUrl).replace(/\/$/, "");

export const publicHttp = axios.create({
  baseURL: apiUrl,
  timeout: 20000,
});

export const adminHttp = axios.create({
  baseURL: `${apiUrl}/admin`,
  timeout: 20000,
});

adminHttp.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

publicHttp.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeError(error)),
);

adminHttp.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(normalizeError(error));
  },
);
