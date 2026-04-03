import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { EmptyState } from "@/components/EmptyState";
import { PageHero } from "@/components/PageHero";
import { adminQueryKeys, publicQueryKeys } from "@/hooks/queryKeys";
import { useCartStore } from "@/store/cartStore";
import { publicApi } from "@/services/publicApi";
import { estimateShipping, formatCurrency, isValidEmail, isValidPhone } from "@/utils/helpers";
import { usePageMeta } from "@/hooks/usePageMeta";

const initialForm = {
  customerName: "",
  phone: "",
  email: "",
  address: "",
  note: "",
};

export const CheckoutPage = () => {
  usePageMeta("Đặt hàng", "Hoàn tất thông tin giao hàng và xác nhận đơn nội thất của bạn.");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const [form, setForm] = useState(initialForm);
  const checkoutMutation = useMutation({
    mutationFn: publicApi.createOrder,
    onSuccess: async (order) => {
      clearCart();
      toast.success("Đặt hàng thành công");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.ordersRoot() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.productsRoot() }),
      ]);
      navigate(`/checkout/success?code=${order.code}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Không thể hoàn tất đơn hàng");
    },
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = estimateShipping(subtotal);
  const total = subtotal + shippingFee;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.customerName.trim().length < 2) {
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

    if (form.address.trim().length < 10) {
      toast.error("Vui lòng nhập địa chỉ giao hàng chi tiết");
      return;
    }

    await checkoutMutation.mutateAsync({
        customerName: form.customerName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        note: form.note,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
  };

  return (
    <div className="pb-24">
      <PageHero
        eyebrow="Checkout"
        title="Xác nhận đơn hàng"
        description="Điền thông tin nhận hàng để hoàn tất đơn và đội ngũ Lumina Maison sẽ liên hệ xác nhận."
      />

      <section className="shell mt-10">
        {items.length === 0 ? (
          <EmptyState
            title="Không có sản phẩm để đặt hàng"
            description="Bạn cần thêm ít nhất một sản phẩm vào giỏ trước khi sang bước thanh toán."
            action={
              <Link className="luxury-button" to="/products">
                Khám phá sản phẩm
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr,360px]">
            <form className="surface-card p-6 sm:p-8" onSubmit={handleSubmit}>
              <h2 className="font-display text-4xl font-semibold text-espresso">Thông tin khách hàng</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  className="field"
                  placeholder="Họ và tên"
                  value={form.customerName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, customerName: event.target.value }))
                  }
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
                  placeholder="Địa chỉ giao hàng"
                  value={form.address}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, address: event.target.value }))
                  }
                />
              </div>
              <textarea
                className="field mt-4 min-h-[150px]"
                placeholder="Ghi chú thêm cho đơn hàng"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              />

              <button
                className="luxury-button mt-6"
                disabled={checkoutMutation.isPending}
                type="submit"
              >
                {checkoutMutation.isPending ? "Đang tạo đơn..." : "Xác nhận đặt hàng"}
              </button>
            </form>

            <aside className="surface-panel h-fit p-6">
              <h2 className="font-display text-3xl font-semibold text-espresso">Tóm tắt</h2>
              <div className="mt-6 space-y-4 text-sm text-stone">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-espresso">{item.name}</p>
                      <p>x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-espresso">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[#eadfce] pt-4">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-espresso">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí giao hàng</span>
                  <span className="font-semibold text-espresso">{formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold text-espresso">Tổng thanh toán</span>
                  <span className="font-bold text-espresso">{formatCurrency(total)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
};
