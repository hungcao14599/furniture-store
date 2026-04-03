import { Heart, RefreshCcw, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { Product } from "@/types/api";
import { formatCurrency, resolveImageUrl } from "@/utils/helpers";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = ({ product }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <article className="group relative flex h-full flex-col bg-white transition duration-300">
      <div className="relative overflow-hidden">
        <Link className="block overflow-hidden" to={`/products/${product.slug}`}>
          <img
            src={resolveImageUrl(product.images[0]?.url)}
            alt={product.name}
            className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
          />
        </Link>

        <div className="absolute right-4 top-4 flex gap-2 opacity-100 transition duration-300 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <div className="relative group/action">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/96 text-[#7a7a7a] shadow-soft transition hover:bg-[#c39b58] hover:text-white"
              onClick={() => toast.success("Đã lưu vào danh sách yêu thích")}
              type="button"
            >
              <Heart className="h-[18px] w-[18px]" />
            </button>
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-white px-2 py-1 text-xs font-medium text-[#4c4c4c] opacity-0 shadow-soft transition group-hover/action:opacity-100">
              Yêu thích
            </span>
          </div>

          <div className="relative group/action">
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/96 text-[#7a7a7a] shadow-soft transition hover:bg-[#c39b58] hover:text-white"
              onClick={() => {
                addItem(product, 1);
                toast.success("Đã thêm sản phẩm vào giỏ");
              }}
              type="button"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
            </button>
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-white px-2 py-1 text-xs font-medium text-[#4c4c4c] opacity-0 shadow-soft transition group-hover/action:opacity-100">
              Giỏ hàng
            </span>
          </div>

          <div className="relative group/action">
            <Link
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/96 text-[#7a7a7a] shadow-soft transition hover:bg-[#c39b58] hover:text-white"
              to={`/products/${product.slug}`}
            >
              <RefreshCcw className="h-[18px] w-[18px]" />
            </Link>
            <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-[2px] bg-white px-2 py-1 text-xs font-medium text-[#4c4c4c] opacity-0 shadow-soft transition group-hover/action:opacity-100">
              Xem nhanh
            </span>
          </div>
        </div>

        {product.bestSeller ? (
          <div className="absolute left-3 top-3 rounded-[6px] bg-[#df4a43] px-2 py-1 text-xs font-semibold text-white">
            Hot
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-2 pt-4 text-center">
        <Link to={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[56px] text-[18px] font-semibold leading-7 text-espresso transition group-hover:text-walnut">
            {product.name}
          </h3>
        </Link>
        <p className="mt-2 text-[15px] font-bold text-[#c39557]">
          {formatCurrency(product.price)}
          <span className="ml-1 text-[13px] font-semibold uppercase">VND</span>
        </p>
      </div>
    </article>
  );
};
