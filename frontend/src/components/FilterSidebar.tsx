import { Category } from "@/types/api";

type FiltersState = {
  category: string;
  pricePreset: string;
  status: string;
};

type FilterSidebarProps = {
  filters: FiltersState;
  categories: Category[];
  onChange: (patch: Partial<FiltersState>) => void;
  onReset: () => void;
};

const priceOptions = [
  { label: "dưới 5 triệu", value: "under_5" },
  { label: "từ 5 triệu đến 8 triệu", value: "from_5_to_8" },
  { label: "trên 8 triệu", value: "over_8" },
];

const statusOptions = [
  { label: "Nổi Bật", value: "featured" },
  { label: "Giảm giá", value: "sale" },
  { label: "Còn hàng", value: "in_stock" },
];

export const FilterSidebar = ({
  filters,
  categories,
  onChange,
  onReset,
}: FilterSidebarProps) => {
  return (
    <aside className="h-fit bg-white px-4 py-2 sm:px-5">
      <section className="pb-6">
        <h3 className="text-[20px] font-bold uppercase tracking-[-0.01em] text-espresso">Danh Mục</h3>
        <div className="mt-4 border-t border-[#ebe4da] pt-3">
          {categories.map((category) => {
            const active = filters.category === category.slug;

            return (
              <button
                key={category.id}
                className={`flex w-full items-center gap-4 border-b border-dashed border-[#ece3d7] px-0 py-3 text-left text-[16px] transition ${
                  active ? "font-semibold text-[#c39b58]" : "text-[#4c4c4c] hover:text-espresso"
                }`}
                onClick={() =>
                  onChange({
                    category: active ? "" : category.slug,
                  })
                }
                type="button"
              >
                <span className="text-[9px] leading-none text-[#3a3a3a]">■</span>
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="py-0">
        <h3 className="text-[20px] font-bold uppercase tracking-[-0.01em] text-espresso">Giá Sản Phẩm</h3>
        <div className="mt-4 border-t border-[#ebe4da] pt-3">
          {priceOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 py-2 text-[16px] text-[#4c4c4c]"
            >
              <input
                checked={filters.pricePreset === option.value}
                className="h-[18px] w-[18px] accent-[#111111]"
                name="price-preset"
                onChange={() => onChange({ pricePreset: option.value })}
                type="radio"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="py-4">
        <h3 className="text-[20px] font-bold uppercase tracking-[-0.01em] text-espresso">Trạng Thái</h3>
        <div className="mt-4 border-t border-[#ebe4da] pt-4">
          <div className="flex flex-wrap gap-2.5">
            {statusOptions.map((option) => {
              const active = filters.status === option.value;

              return (
                <button
                  key={option.value}
                  className={`rounded-md border px-4 py-2 text-[15px] font-medium transition ${
                    active
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#e7dfd2] bg-white text-[#4c4c4c] hover:border-[#111111] hover:text-espresso"
                  }`}
                  onClick={() =>
                    onChange({
                      status: active ? "" : option.value,
                    })
                  }
                  type="button"
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="mt-8 inline-flex min-w-[118px] rounded-md items-center justify-center rounded-[2px] bg-[#151b28] px-7 py-2 text-[16px] font-semibold text-white transition hover:bg-[#20283a]"
          onClick={onReset}
          type="button"
        >
          Đặt lại
        </button>
      </section>
    </aside>
  );
};
