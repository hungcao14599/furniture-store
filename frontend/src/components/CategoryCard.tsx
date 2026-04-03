import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Category } from "@/types/api";
import { resolveImageUrl } from "@/utils/helpers";

type CategoryCardProps = {
  category: Category;
  index?: number;
};

export const CategoryCard = ({ category, index = 0 }: CategoryCardProps) => {
  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-[#e5dccf] bg-white transition duration-300 hover:-translate-y-1 hover:border-[#d8cab6] hover:shadow-soft"
    >
      <div className="relative overflow-hidden bg-[#f7f3ec] p-4">
        <img
          src={resolveImageUrl(category.image)}
          alt={category.name}
          className="aspect-[5/3] w-full rounded-[14px] object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between">
          <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-stone shadow-[0_8px_24px_rgba(17,17,17,0.08)]">
            Danh mục
          </span>
          <span className="rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-espresso shadow-[0_8px_24px_rgba(17,17,17,0.08)]">
            {(index + 1).toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4 text-left">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[22px] font-bold tracking-[-0.03em] text-espresso">{category.name}</h3>
          <span className="shrink-0 rounded-full bg-[#f7f3ec] px-3 py-1 text-[11px] font-bold text-stone">
            {category._count?.products ?? 0} mẫu
          </span>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-7 text-stone">
          {category.description ||
            "Khám phá bộ sưu tập được chọn lọc cho không gian sống hiện đại, cân bằng giữa công năng và cảm giác thẩm mỹ."}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-[#efe6da] pt-4">
          <span className="text-sm font-bold text-espresso">Xem sản phẩm</span>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#e3d9cb] bg-[#fbfaf7] text-espresso transition group-hover:border-[#111111] group-hover:bg-[#111111] group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};
