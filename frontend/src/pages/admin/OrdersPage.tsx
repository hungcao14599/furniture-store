import { useState } from "react";
import { Link } from "react-router-dom";
import { OrderStatus } from "@/types/api";
import { useAdminOrdersQuery } from "@/hooks/useAdminQueries";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Pagination } from "@/components/Pagination";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { ORDER_STATUS_LABELS } from "@/utils/constants";
import { usePageMeta } from "@/hooks/usePageMeta";

export const OrdersPage = () => {
  usePageMeta("Quản lý đơn hàng", "Danh sách đơn hàng và bộ lọc trạng thái.");

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const { data, isLoading } = useAdminOrdersQuery(page, status || undefined);
  const orders = data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Đơn hàng"
        description="Theo dõi trạng thái từng đơn, lọc nhanh theo tiến độ xử lý và chuyển sang màn chi tiết để cập nhật."
      />

      <div className="surface-panel p-5">
        <select
          className="field max-w-[240px]"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as OrderStatus | "");
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Đang tải đơn hàng..." />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto p-6">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày tạo</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-semibold text-espresso">{order.code}</td>
                    <td>{order.customerName}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="font-semibold text-espresso">{formatCurrency(order.total)}</td>
                    <td>
                      <StatusBadge status={order.status} />
                    </td>
                    <td>
                      <Link className="font-semibold text-espresso" to={`/admin/orders/${order.id}`}>
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pb-6">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};
