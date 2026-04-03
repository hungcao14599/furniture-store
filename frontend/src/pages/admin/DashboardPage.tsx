import { ArrowRight, MessageSquare, Package, PenSquare, Receipt } from "lucide-react";
import { Link } from "react-router-dom";
import { useDashboardSummaryQuery } from "@/hooks/useAdminQueries";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { formatCurrency, formatDate } from "@/utils/helpers";
import { usePageMeta } from "@/hooks/usePageMeta";

export const DashboardPage = () => {
  usePageMeta("Dashboard", "Tổng quan vận hành website nội thất Lumina Maison.");

  const { data, isLoading, error } = useDashboardSummaryQuery();

  if (isLoading) {
    return <LoadingSpinner label="Đang tải dashboard..." />;
  }

  if (!data || error) {
    return (
      <div className="surface-card px-6 py-12 text-center text-sm text-stone">
        {error instanceof Error ? error.message : "Không thể tải dashboard"}
      </div>
    );
  }

  const cards = [
    {
      label: "Sản phẩm",
      value: data.metrics.productCount,
      description: "Danh mục nội thất đang hiển thị trên website.",
      icon: Package,
    },
    {
      label: "Đơn hàng",
      value: data.metrics.orderCount,
      description: "Tổng số đơn đã được ghi nhận từ khách hàng.",
      icon: Receipt,
    },
    {
      label: "Bài viết",
      value: data.metrics.postCount,
      description: "Nội dung tư vấn, xu hướng và cảm hứng nội thất.",
      icon: PenSquare,
    },
    {
      label: "Liên hệ",
      value: data.metrics.contactMessageCount,
      description: "Yêu cầu tư vấn đang được gửi từ form liên hệ.",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Trung tâm vận hành"
        title="Dashboard"
        description="Theo dõi nhanh tình trạng dữ liệu, đơn hàng mới và nhịp vận hành của showroom trên cùng một màn hình."
        actions={
          <Link className="luxury-button-outline" to="/admin/orders">
            Xem đơn hàng
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="surface-card p-6">
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[14px] border border-[#ece2d6] bg-[#f7f3ec]">
                <card.icon className="h-5 w-5 text-espresso" />
              </span>
              <span className="rounded-full border border-[#e7ddd1] bg-[#fbfaf7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-stone">
                Live
              </span>
            </div>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
              {card.label}
            </p>
            <p className="mt-3 text-[44px] font-bold tracking-[-0.04em] text-espresso">{card.value}</p>
            <p className="mt-2 text-sm leading-7 text-stone">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="surface-card p-6">
        <div className="flex flex-col gap-3 border-b border-[#eee4d7] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[28px] font-bold tracking-[-0.03em] text-espresso">Đơn hàng gần đây</h2>
            <p className="mt-2 text-sm leading-7 text-stone">
              Danh sách đơn mới nhất để theo dõi tiến độ xác nhận và giao vận.
            </p>
          </div>
          <Link className="text-sm font-semibold text-espresso transition hover:text-[#6d665d]" to="/admin/orders">
            Đi tới quản lý đơn hàng
          </Link>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày tạo</th>
                <th>Giá trị</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.latestOrders.map((order) => (
                <tr key={order.id}>
                  <td className="font-semibold text-espresso">{order.code}</td>
                  <td>{order.customerName}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td className="font-semibold text-espresso">{formatCurrency(order.total)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
