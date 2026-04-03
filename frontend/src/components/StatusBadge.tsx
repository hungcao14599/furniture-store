import { ORDER_STATUS_LABELS } from "@/utils/constants";
import { OrderStatus } from "@/types/api";

type StatusBadgeProps = {
  status: OrderStatus | "HANDLED" | "UNHANDLED";
};

const statusClassMap: Record<StatusBadgeProps["status"], string> = {
  NEW: "border border-[#ead8b5] bg-[#fff6e3] text-[#8f6513]",
  PROCESSING: "border border-[#cfe4f4] bg-[#eef7fd] text-[#215a80]",
  CONFIRMED: "border border-[#dbd5f4] bg-[#f4f1fe] text-[#5842a1]",
  SHIPPING: "border border-[#cedcf4] bg-[#eef4fe] text-[#2756a3]",
  COMPLETED: "border border-[#cfe5d7] bg-[#eef9f2] text-[#1f6a43]",
  CANCELED: "border border-[#f0d0d0] bg-[#fff1f1] text-[#9b3d3d]",
  HANDLED: "border border-[#cfe5d7] bg-[#eef9f2] text-[#1f6a43]",
  UNHANDLED: "border border-[#ead8b5] bg-[#fff6e3] text-[#8f6513]",
};

const labelMap: Record<StatusBadgeProps["status"], string> = {
  ...ORDER_STATUS_LABELS,
  HANDLED: "Đã xử lý",
  UNHANDLED: "Chưa xử lý",
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClassMap[status]}`}>
      {labelMap[status]}
    </span>
  );
};
