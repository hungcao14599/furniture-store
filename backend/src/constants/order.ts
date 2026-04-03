export const ORDER_STATUS_VALUES = [
  "NEW",
  "PROCESSING",
  "CONFIRMED",
  "SHIPPING",
  "COMPLETED",
  "CANCELED",
] as const;

export const ORDER_STATUS_LABELS: Record<(typeof ORDER_STATUS_VALUES)[number], string> = {
  NEW: "Mới",
  PROCESSING: "Đang xử lý",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELED: "Đã hủy",
};

export const FREE_SHIPPING_THRESHOLD = 30000000;
export const STANDARD_SHIPPING_FEE = 350000;
