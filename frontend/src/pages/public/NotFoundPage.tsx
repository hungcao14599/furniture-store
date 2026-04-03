import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";

export const NotFoundPage = () => {
  usePageMeta("404", "Trang bạn tìm kiếm không tồn tại.");

  return (
    <div className="shell py-20">
      <div className="surface-card relative overflow-hidden px-8 py-16 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(201,183,165,0.24),_transparent_26%)]" />
        <div className="relative">
          <p className="eyebrow">404</p>
          <h1 className="mt-6 font-display text-6xl font-semibold text-espresso md:text-7xl">
            Không tìm thấy trang
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone">
            Có thể đường dẫn đã thay đổi hoặc trang này không còn tồn tại. Bạn có thể quay lại trang
            chủ hoặc tiếp tục khám phá bộ sưu tập nội thất.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link className="luxury-button" to="/">
              Về trang chủ
            </Link>
            <Link className="luxury-button-outline" to="/products">
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
