import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { adminQueryKeys } from "@/hooks/queryKeys";
import { useAdminOrderByIdQuery } from "@/hooks/useAdminQueries";
import { OrderStatus } from "@/types/api";
import { adminApi } from "@/services/adminApi";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate, resolveImageUrl } from "@/utils/helpers";
import { ORDER_STATUS_LABELS } from "@/utils/constants";
import { usePageMeta } from "@/hooks/usePageMeta";

export const OrderDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: order, isLoading, error } = useAdminOrderByIdQuery(id);
  const [status, setStatus] = useState<OrderStatus>("NEW");
  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, nextStatus }: { orderId: string; nextStatus: OrderStatus }) =>
      adminApi.updateOrderStatus(orderId, nextStatus),
    onSuccess: async (updated) => {
      queryClient.setQueryData(adminQueryKeys.order(id), updated);
      toast.success("Đã cập nhật trạng thái đơn hàng");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.ordersRoot() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() }),
      ]);
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : "Không thể cập nhật trạng thái",
      );
    },
  });

  usePageMeta("Chi tiết đơn hàng", "Xem chi tiết và cập nhật trạng thái đơn.");

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải đơn hàng");
    }
  }, [error]);

  if (isLoading) {
    return <LoadingSpinner label="Đang tải chi tiết đơn hàng..." />;
  }

  if (!order) {
    return <div className="surface-card px-6 py-12 text-center text-sm text-stone">Không tìm thấy đơn hàng.</div>;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Chi tiết đơn hàng"
        title={order.code}
        description="Kiểm tra thông tin khách hàng, cập nhật trạng thái đơn và rà soát danh sách sản phẩm đã đặt."
        actions={
          <Link className="luxury-button-outline" to="/admin/orders">
            Quay lại danh sách
          </Link>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[0.85fr,1.15fr]">
        <div className="space-y-6">
          <div className="surface-card p-6">
            <h2 className="text-[28px] font-bold tracking-[-0.03em] text-espresso">Khách hàng</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-stone">
              <p>
                <span className="font-semibold text-espresso">Họ tên:</span> {order.customerName}
              </p>
              <p>
                <span className="font-semibold text-espresso">Điện thoại:</span> {order.phone}
              </p>
              <p>
                <span className="font-semibold text-espresso">Email:</span> {order.email}
              </p>
              <p>
                <span className="font-semibold text-espresso">Địa chỉ:</span> {order.address}
              </p>
              {order.note ? (
                <p>
                  <span className="font-semibold text-espresso">Ghi chú:</span> {order.note}
                </p>
              ) : null}
              <p>
                <span className="font-semibold text-espresso">Ngày tạo:</span> {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          <div className="surface-card p-6">
            <h2 className="text-[28px] font-bold tracking-[-0.03em] text-espresso">Trạng thái</h2>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <StatusBadge status={order.status} />
              <select
                className="field max-w-[240px]"
                value={status}
                onChange={(event) => setStatus(event.target.value as OrderStatus)}
              >
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                className="luxury-button"
                disabled={updateStatusMutation.isPending}
                onClick={async () => {
                  if (!id) {
                    return;
                  }

                  await updateStatusMutation.mutateAsync({
                    orderId: id,
                    nextStatus: status,
                  });
                }}
              >
                {updateStatusMutation.isPending ? "Đang lưu..." : "Lưu trạng thái"}
              </button>
            </div>
          </div>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-[28px] font-bold tracking-[-0.03em] text-espresso">Sản phẩm</h2>
          <div className="mt-6 space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[18px] border border-[#ece4d8] bg-[#fbf8f2] p-4 sm:flex-row"
              >
                <img
                  src={resolveImageUrl(item.imageSnapshot)}
                  alt={item.productNameSnapshot}
                  className="h-28 w-full rounded-[14px] object-cover sm:w-28"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-espresso">{item.productNameSnapshot}</h3>
                  <p className="mt-1 text-sm text-stone">Số lượng: {item.quantity}</p>
                  <p className="mt-1 text-sm text-stone">
                    Đơn giá: {formatCurrency(item.unitPrice)}
                  </p>
                </div>
                <p className="font-semibold text-espresso">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[#efe3d4] pt-6 text-sm text-stone">
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <span className="font-semibold text-espresso">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span>Phí giao hàng</span>
              <span className="font-semibold text-espresso">{formatCurrency(order.shippingFee)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-base">
              <span className="font-semibold text-espresso">Tổng cộng</span>
              <span className="font-bold text-espresso">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
