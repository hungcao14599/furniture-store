import { SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductQuery } from "@/types/api";
import { useCategoriesQuery, useProductsQuery } from "@/hooks/usePublicQueries";
import { usePageMeta } from "@/hooks/usePageMeta";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProductCard } from "@/components/ProductCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";

const resolvePricePreset = (value: string) => {
  switch (value) {
    case "under_5":
      return { minPrice: undefined, maxPrice: 5_000_000 };
    case "from_5_to_8":
      return { minPrice: 5_000_000, maxPrice: 8_000_000 };
    case "over_8":
      return { minPrice: 8_000_000, maxPrice: undefined };
    default:
      return { minPrice: undefined, maxPrice: undefined };
  }
};

export const ProductsPage = () => {
  usePageMeta(
    "Bộ sưu tập nội thất",
    "Danh sách sofa, bàn ăn, ghế, giường ngủ, đèn trang trí với bộ lọc theo danh mục, giá và trạng thái.",
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filters = useMemo(
    () => ({
      category: searchParams.get("category") ?? "",
      pricePreset: searchParams.get("pricePreset") ?? "",
      status: searchParams.get("status") ?? "",
      sort: searchParams.get("sort") ?? "newest",
      limit: Number(searchParams.get("limit") ?? "12") || 12,
      page: Number(searchParams.get("page") ?? "1") || 1,
    }),
    [searchParams],
  );

  const updateParams = (patch: Record<string, string | number>) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(patch).forEach(([key, value]) => {
      if (value === "" || value === 0) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });

    if (!patch.page) {
      next.set("page", "1");
    }

    setSearchParams(next);
  };

  const { data: categories = [] } = useCategoriesQuery();
  const productQuery = useMemo<ProductQuery>(() => {
    const { minPrice, maxPrice } = resolvePricePreset(filters.pricePreset);

    return {
      page: filters.page,
      limit: filters.limit,
      category: filters.category || undefined,
      minPrice,
      maxPrice,
      sort: filters.sort as "newest" | "price_asc" | "price_desc" | "featured",
      featured: filters.status === "featured" ? true : undefined,
      bestSeller: filters.status === "sale" ? true : undefined,
    };
  }, [filters]);
  const { data, isLoading, error } = useProductsQuery(productQuery);
  const products =
    filters.status === "in_stock"
      ? data?.items.filter((item) => item.stock > 0) ?? []
      : data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;
  const totalItems = data?.pagination.total ?? 0;

  return (
    <div className="pb-24 pt-8 lg:pt-10">
      <section className="shell">
        <div className="mb-5 flex items-center justify-between rounded-[14px] border border-[#ebe4da] bg-white px-4 py-4 shadow-soft lg:hidden">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone">Danh sách sản phẩm</p>
            <p className="mt-1 text-sm text-[#4c4c4c]">Tổng {totalItems} sản phẩm</p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-[10px] bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#242424]"
            onClick={() => setMobileFiltersOpen(true)}
            type="button"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-[260px,minmax(0,1fr)]">
          <div className="hidden lg:block">
            <FilterSidebar
              filters={{
                category: filters.category,
                pricePreset: filters.pricePreset,
                status: filters.status,
              }}
              categories={categories}
              onChange={(patch) => updateParams(patch)}
              onReset={() => setSearchParams(new URLSearchParams({ limit: String(filters.limit) }))}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-4 rounded-[14px] border border-[#ebe4da] bg-[#f1f1f1] px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-[15px] text-[#4c4c4c] sm:text-[16px]">
                <span className="font-semibold text-espresso">Hiển thị:</span>
                {[12, 24, 36].map((value) => (
                  <button
                    key={value}
                    className={`rounded-[8px] px-2 py-1 transition ${
                      filters.limit === value ? "bg-white font-bold text-espresso" : "hover:text-espresso"
                    }`}
                    onClick={() => updateParams({ limit: value, page: 1 })}
                    type="button"
                  >
                    {value}
                  </button>
                ))}
                <span className="text-sm text-stone">Tổng {totalItems} sản phẩm</span>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-start">
                <label className="text-[15px] font-semibold text-espresso sm:text-[16px]" htmlFor="sort-products">
                  Sắp xếp
                </label>
                <select
                  className="rounded-[10px] border border-[#ddd4c8] bg-white px-3 py-2 text-[15px] font-semibold text-espresso outline-none transition focus:border-[#111111]"
                  id="sort-products"
                  value={filters.sort}
                  onChange={(event) => updateParams({ sort: event.target.value, page: 1 })}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                  <option value="featured">Nổi bật</option>
                </select>
              </div>
            </div>

            {isLoading ? <LoadingSpinner label="Đang tải danh sách sản phẩm..." /> : null}
            {!isLoading && error ? (
              <div className="mt-6 rounded-[14px] border border-[#ebe4da] bg-white px-6 py-10 text-center text-sm text-stone">
                {error instanceof Error ? error.message : "Không thể tải danh sách sản phẩm"}
              </div>
            ) : null}
            {!isLoading && !error && products.length === 0 ? (
              <div className="mt-6">
                <EmptyState
                  title="Chưa có sản phẩm phù hợp"
                  description="Hãy thử thay đổi danh mục, mức giá hoặc trạng thái sản phẩm."
                />
              </div>
            ) : null}

            {!isLoading && !error && products.length > 0 ? (
              <>
                <div className="mt-7 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={filters.page}
                  totalPages={totalPages}
                  onPageChange={(page) => updateParams({ page })}
                />
              </>
            ) : null}
          </div>
        </div>
      </section>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileFiltersOpen(false)}
            type="button"
          />
          <div className="absolute left-0 top-0 h-full w-[88vw] max-w-[360px] overflow-y-auto bg-[#f8f5f0] p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between rounded-[14px] bg-white px-4 py-4 shadow-soft">
              <div>
                <p className="text-[18px] font-bold uppercase text-espresso">Bộ lọc</p>
                <p className="mt-1 text-sm text-stone">Tinh chỉnh danh mục và mức giá</p>
              </div>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e2d8ca] bg-white text-espresso"
                onClick={() => setMobileFiltersOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <FilterSidebar
              filters={{
                category: filters.category,
                pricePreset: filters.pricePreset,
                status: filters.status,
              }}
              categories={categories}
              onChange={(patch) => updateParams(patch)}
              onReset={() => setSearchParams(new URLSearchParams({ limit: String(filters.limit) }))}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
