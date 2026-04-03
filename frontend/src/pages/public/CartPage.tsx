import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { PageHero } from "@/components/PageHero";
import { QuantitySelector } from "@/components/QuantitySelector";
import { useCartStore } from "@/store/cartStore";
import { estimateShipping, formatCurrency, resolveImageUrl } from "@/utils/helpers";
import { usePageMeta } from "@/hooks/usePageMeta";

export const CartPage = () => {
  usePageMeta("Giỏ hàng", "Xem và cập nhật các sản phẩm nội thất bạn đã chọn.");

  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = estimateShipping(subtotal);
  const total = subtotal + shippingFee;

  return (
    <div className="pb-24">
      <PageHero
        eyebrow="Shopping Cart"
        title="Giỏ hàng của bạn"
        description="Kiểm tra số lượng, tổng giá trị và tiếp tục sang bước xác nhận đơn hàng."
      />

      <section className="shell mt-10">
        {items.length === 0 ? (
          <EmptyState
            title="Giỏ hàng đang trống"
            description="Hãy khám phá bộ sưu tập nội thất để thêm những món đồ phù hợp cho không gian của bạn."
            action={
              <Link className="luxury-button" to="/products">
                Xem sản phẩm
              </Link>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="surface-card flex flex-col gap-5 p-5 sm:flex-row">
                  <img
                    src={resolveImageUrl(item.image)}
                    alt={item.name}
                    className="h-40 w-full rounded-[24px] object-cover sm:w-40"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link to={`/products/${item.slug}`} className="font-display text-3xl font-semibold text-espresso">
                          {item.name}
                        </Link>
                        <p className="mt-2 text-sm font-semibold text-stone">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <button className="text-sm font-semibold text-rose-600" onClick={() => removeItem(item.productId)}>
                        Xóa
                      </button>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                      <QuantitySelector
                        value={item.quantity}
                        max={item.stock}
                        onChange={(value) => updateQuantity(item.productId, value)}
                      />
                      <p className="text-base font-bold text-espresso">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="surface-panel h-fit p-6">
              <h2 className="font-display text-3xl font-semibold text-espresso">Tóm tắt đơn hàng</h2>
              <div className="mt-6 space-y-4 text-sm text-stone">
                <div className="flex items-center justify-between">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-espresso">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Phí giao hàng</span>
                  <span className="font-semibold text-espresso">{formatCurrency(shippingFee)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-[#eadfce] pt-4 text-base">
                  <span className="font-semibold text-espresso">Tổng cộng</span>
                  <span className="font-bold text-espresso">{formatCurrency(total)}</span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-6 text-stone">
                Miễn phí giao hàng cho đơn từ 30.000.000 VND trong khu vực nội thành TP.HCM.
              </p>

              <Link className="luxury-button mt-6 w-full" to="/checkout">
                Tiến hành đặt hàng
              </Link>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
};
