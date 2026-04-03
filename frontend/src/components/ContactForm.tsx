import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { publicQueryKeys } from "@/hooks/queryKeys";
import { publicApi } from "@/services/publicApi";
import { isValidEmail, isValidPhone } from "@/utils/helpers";

type ContactFormProps = {
  compact?: boolean;
};

const initialForm = {
  name: "",
  phone: "",
  email: "",
  subject: "",
  message: "",
};

export const ContactForm = ({ compact = false }: ContactFormProps) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const contactMutation = useMutation({
    mutationFn: publicApi.createContactMessage,
    onSuccess: async () => {
      toast.success("Yêu cầu tư vấn đã được gửi");
      setForm(initialForm);
      await queryClient.invalidateQueries({ queryKey: publicQueryKeys.home() });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Không thể gửi yêu cầu");
    },
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      toast.error("Vui lòng nhập họ tên hợp lệ");
      return;
    }

    if (!isValidPhone(form.phone)) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Vui lòng nhập email hợp lệ");
      return;
    }

    if (form.subject.trim().length < 4 || form.message.trim().length < 10) {
      toast.error("Vui lòng điền đầy đủ tiêu đề và nội dung");
      return;
    }

    await contactMutation.mutateAsync(form);
  };

  return (
    <form className="surface-card p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="mb-6">
        <span className="eyebrow">Gửi yêu cầu</span>
        <h3 className="mt-4 text-2xl font-bold text-espresso">Nhận tư vấn nhanh từ showroom</h3>
        <p className="mt-3 text-sm leading-7 text-stone">
          Để lại thông tin để đội ngũ tư vấn gợi ý danh mục, chất liệu và phương án phù hợp.
        </p>
      </div>
      <div className={compact ? "grid gap-4 md:grid-cols-2" : "grid gap-4"}>
        <input
          className="field"
          placeholder="Họ và tên"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        />
        <input
          className="field"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
        />
        <input
          className="field"
          placeholder="Email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        />
        <input
          className="field"
          placeholder="Chủ đề"
          value={form.subject}
          onChange={(event) =>
            setForm((current) => ({ ...current, subject: event.target.value }))
          }
        />
      </div>

      <textarea
        className="field mt-4 min-h-[140px]"
        placeholder="Chia sẻ nhu cầu về sản phẩm, không gian hoặc dịch vụ tư vấn của bạn"
        value={form.message}
        onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
      />

      <button
        className="luxury-button mt-5 w-full sm:w-auto"
        disabled={contactMutation.isPending}
        type="submit"
      >
        {contactMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu nhanh"}
      </button>
    </form>
  );
};
