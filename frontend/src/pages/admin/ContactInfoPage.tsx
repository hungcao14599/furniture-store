import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ContactInfo } from "@/types/api";
import { adminQueryKeys, publicQueryKeys } from "@/hooks/queryKeys";
import { useAdminContactInfoQuery } from "@/hooks/useAdminQueries";
import { adminApi } from "@/services/adminApi";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { usePageMeta } from "@/hooks/usePageMeta";
import { isValidEmail, isValidPhone } from "@/utils/helpers";

export const ContactInfoPage = () => {
  usePageMeta("Thông tin liên hệ", "Quản lý thông tin showroom và liên hệ công ty.");

  const queryClient = useQueryClient();
  const [form, setForm] = useState<ContactInfo | null>(null);
  const { data, isLoading, error } = useAdminContactInfoQuery();
  const contactMutation = useMutation({
    mutationFn: adminApi.updateContactInfo,
    onSuccess: async (updated) => {
      setForm(updated);
      queryClient.setQueryData(adminQueryKeys.contactInfo(), updated);
      queryClient.setQueryData(publicQueryKeys.contactInfo(), updated);
      toast.success("Đã cập nhật thông tin liên hệ");
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.home() });
    },
    onError: (mutationError) => {
      toast.error(
        mutationError instanceof Error ? mutationError.message : "Không thể lưu thông tin liên hệ",
      );
    },
  });

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải thông tin liên hệ");
    }
  }, [error]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form) {
      return;
    }

    if (!isValidPhone(form.phone) || !isValidEmail(form.email) || form.address.trim().length < 10) {
      toast.error("Thông tin liên hệ chưa hợp lệ");
      return;
    }

    await contactMutation.mutateAsync(form);
  };

  if (isLoading || !form) {
    return <LoadingSpinner label="Đang tải thông tin liên hệ..." />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Thông tin showroom"
        description="Cập nhật các đầu mối liên hệ, giờ làm việc, liên kết mạng xã hội và thông tin bản đồ hiển thị ở website."
      />

      <form className="surface-card p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="field"
            placeholder="Số điện thoại"
            value={form.phone}
            onChange={(event) => setForm((current) => current && { ...current, phone: event.target.value })}
          />
          <input
            className="field"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm((current) => current && { ...current, email: event.target.value })}
          />
          <input
            className="field md:col-span-2"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(event) => setForm((current) => current && { ...current, address: event.target.value })}
          />
          <input
            className="field"
            placeholder="Facebook"
            value={form.facebook ?? ""}
            onChange={(event) => setForm((current) => current && { ...current, facebook: event.target.value })}
          />
          <input
            className="field"
            placeholder="Zalo"
            value={form.zalo ?? ""}
            onChange={(event) => setForm((current) => current && { ...current, zalo: event.target.value })}
          />
          <input
            className="field"
            placeholder="Instagram"
            value={form.instagram ?? ""}
            onChange={(event) =>
              setForm((current) => current && { ...current, instagram: event.target.value })
            }
          />
          <input
            className="field"
            placeholder="Giờ làm việc"
            value={form.workingHours}
            onChange={(event) =>
              setForm((current) => current && { ...current, workingHours: event.target.value })
            }
          />
          <input
            className="field md:col-span-2"
            placeholder="Map Embed URL"
            value={form.mapEmbedUrl ?? ""}
            onChange={(event) =>
              setForm((current) => current && { ...current, mapEmbedUrl: event.target.value })
            }
          />
        </div>

        <textarea
          className="field mt-4 min-h-[160px]"
          placeholder="Đoạn giới thiệu ngắn"
          value={form.introText ?? ""}
          onChange={(event) => setForm((current) => current && { ...current, introText: event.target.value })}
        />

        <button className="luxury-button mt-6" disabled={contactMutation.isPending} type="submit">
          {contactMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
};
