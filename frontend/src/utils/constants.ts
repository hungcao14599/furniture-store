import { OrderStatus } from "@/types/api";

export const FREE_SHIPPING_THRESHOLD = 30000000;
export const STANDARD_SHIPPING_FEE = 350000;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Mới",
  PROCESSING: "Đang xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};
