import { CheckCircle2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");

  usePageMeta("Đặt hàng thành công", "Đơn hàng đã được ghi nhận và đang chờ xác nhận.");

  return (
    <div className="shell py-20">
      <div className="surface-card mx-auto max-w-2xl px-8 py-14 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-5xl font-semibold text-espresso">
          Đặt hàng thành công
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone">
          Cảm ơn bạn đã đặt hàng tại Lumina Maison. Đội ngũ tư vấn sẽ sớm liên hệ để xác nhận chi
          tiết giao hàng và lịch lắp đặt.
        </p>
        {code ? (
          <p className="mt-4 text-sm font-semibold text-espresso">Mã đơn hàng: {code}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link className="luxury-button" to="/products">
            Tiếp tục mua sắm
          </Link>
          <Link className="luxury-button-outline" to="/">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};
