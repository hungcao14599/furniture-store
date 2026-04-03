import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminQueryKeys } from "@/hooks/queryKeys";
import { useAdminContactMessagesQuery } from "@/hooks/useAdminQueries";
import { adminApi } from "@/services/adminApi";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDate } from "@/utils/helpers";
import { usePageMeta } from "@/hooks/usePageMeta";

type FilterState = "all" | "handled" | "unhandled";

export const ContactMessagesPage = () => {
  usePageMeta("Yêu cầu liên hệ", "Quản lý yêu cầu liên hệ từ khách hàng.");

  const [filter, setFilter] = useState<FilterState>("all");
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading, error } = useAdminContactMessagesQuery(filter);
  const toggleMessageMutation = useMutation({
    mutationFn: ({ id, isHandled }: { id: string; isHandled: boolean }) =>
      adminApi.updateContactMessageStatus(id, isHandled),
    onSuccess: async () => {
      toast.success("Đã cập nhật trạng thái");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.contactMessagesRoot() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() }),
      ]);
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : "Không thể cập nhật trạng thái",
      );
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải danh sách liên hệ");
    }
  }, [error]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Form liên hệ khách hàng"
        description="Theo dõi các yêu cầu tư vấn mới, đánh dấu trạng thái xử lý và phản hồi lại từ đội ngũ showroom."
        actions={
          <select
            className="field max-w-[220px]"
            value={filter}
            onChange={(event) => setFilter(event.target.value as FilterState)}
          >
            <option value="all">Tất cả</option>
            <option value="unhandled">Chưa xử lý</option>
            <option value="handled">Đã xử lý</option>
          </select>
        }
      />

      {isLoading ? (
        <LoadingSpinner label="Đang tải yêu cầu liên hệ..." />
      ) : (
        <div className="grid gap-6">
          {messages.map((message) => (
            <article key={message.id} className="surface-card p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-[26px] font-bold tracking-[-0.03em] text-espresso">{message.subject}</h2>
                    <StatusBadge status={message.isHandled ? "HANDLED" : "UNHANDLED"} />
                  </div>
                  <p className="mt-2 text-sm text-stone">
                    {message.name} • {message.phone} • {message.email}
                  </p>
                  <p className="mt-1 text-sm text-stone">{formatDate(message.createdAt)}</p>
                </div>
                <button
                  className="luxury-button-outline"
                  onClick={() =>
                    void toggleMessageMutation.mutateAsync({
                      id: message.id,
                      isHandled: !message.isHandled,
                    })
                  }
                >
                  {message.isHandled ? "Đánh dấu chưa xử lý" : "Đánh dấu đã xử lý"}
                </button>
              </div>
              <p className="mt-5 text-sm leading-8 text-stone">{message.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
