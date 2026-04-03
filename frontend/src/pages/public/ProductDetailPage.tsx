import {
  Heart,
  Link2,
  Mail,
  MessageCircle,
  RefreshCcw,
  Star,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useCategoriesQuery, useProductBySlugQuery } from "@/hooks/usePublicQueries";
import { usePageMeta } from "@/hooks/usePageMeta";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ProductCard } from "@/components/ProductCard";
import { ProductImageZoom } from "@/components/ProductImageZoom";
import { QuantitySelector } from "@/components/QuantitySelector";
import { SectionHeading } from "@/components/SectionHeading";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency, resolveImageUrl } from "@/utils/helpers";

type DetailTab = "info" | "reviews" | "comments";

export const ProductDetailPage = () => {
  const { slug } = useParams();
  const addItem = useCartStore((state) => state.addItem);
  const [activeImage, setActiveImage] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<DetailTab>("info");
  const { data: product, isLoading, error } = useProductBySlugQuery(slug);
  const { data: categories = [] } = useCategoriesQuery();

  usePageMeta(
    product?.name ?? "Chi tiết sản phẩm",
    product?.shortDescription ?? "Chi tiết sản phẩm nội thất tại Lumina Maison.",
  );

  useEffect(() => {
    if (!product) {
      return;
    }
    setActiveImage(product.images[0]?.url ?? "");
    setPreviewImage("");
  }, [product]);

  if (isLoading) {
    return <LoadingSpinner label="Đang tải chi tiết sản phẩm..." />;
  }

  if (!product || error) {
    return (
      <div className="shell py-20">
        <div className="surface-card px-8 py-14 text-center">
          <h1 className="font-display text-4xl font-semibold text-espresso">Sản phẩm không tồn tại</h1>
          <p className="mt-4 text-sm leading-7 text-stone">
            {error instanceof Error ? error.message : "Không tìm thấy sản phẩm này."}
          </p>
          <Link className="luxury-button mt-6" to="/products">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const currentImage = previewImage || activeImage || product.images[0]?.url;
  const isPreviewing = Boolean(previewImage && previewImage !== activeImage);
  const formattedPrice = new Intl.NumberFormat("vi-VN").format(product.price);
  const saleProducts = product.relatedProducts.slice(0, 3);
  const infoParagraphs = product.description
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="pb-24">
      <section className="shell pt-8">
        <div className="mb-6 text-sm text-stone">
          <Link to="/" className="hover:text-espresso">
            Trang chủ
          </Link>{" "}
          /{" "}
          <Link to="/products" className="hover:text-espresso">
            Sản phẩm
          </Link>{" "}
          / <span className="text-espresso">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[220px,1fr] xl:grid-cols-[230px,1fr]">
          <aside className="order-2 space-y-8 lg:order-1">
            <div>
              <h2 className="border-b border-[#ece3d7] pb-4 text-[16px] font-bold uppercase tracking-[0.02em] text-espresso">
                Danh mục
              </h2>
              <div className="mt-3 space-y-0.5">
                {categories.slice(0, 6).map((category) => {
                  const isActive = category.id === product.categoryId;

                  return (
                    <Link
                      key={category.id}
                      to={`/products?category=${category.slug}`}
                      className={`flex items-center gap-3 border-b border-dashed border-[#eee4d8] py-3 text-sm transition ${
                        isActive ? "font-medium text-[#c39b58]" : "text-[#4f4b45] hover:text-espresso"
                      }`}
                    >
                      <span className="h-[5px] w-[5px] bg-current" />
                      {category.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="border-b border-[#ece3d7] pb-4 text-[16px] font-bold uppercase tracking-[0.02em] text-espresso">
                Giảm giá
              </h2>
              <div className="mt-4 space-y-4">
                {saleProducts.map((item) => (
                  <Link
                    key={item.id}
                    to={`/products/${item.slug}`}
                    className="flex gap-3 rounded-[6px] transition hover:opacity-90"
                  >
                    <img
                      src={resolveImageUrl(item.images[0]?.url)}
                      alt={item.name}
                      className="h-[74px] w-[74px] rounded-[4px] object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="line-clamp-2 text-[14px] font-medium leading-5 text-espresso">
                        {item.name}
                      </h3>
                      <p className="mt-2 text-[13px] font-bold text-[#c39b58]">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="order-1 lg:order-2">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr),420px]">
              <div>
                <ProductImageZoom
                  src={resolveImageUrl(currentImage)}
                  alt={product.name}
                  helperText={isPreviewing ? "Đang xem nhanh từ thumbnail" : "Rê chuột trên ảnh để phóng to"}
                />

                <div className="mt-4 grid grid-cols-4 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={image.url}
                      className={`relative overflow-hidden border bg-white transition ${
                        image.url === currentImage ? "border-[#c39b58]" : "border-[#ece3d7] hover:border-[#c39b58]"
                      }`}
                      onMouseEnter={() => setPreviewImage(image.url)}
                      onMouseLeave={() => setPreviewImage("")}
                      onFocus={() => setPreviewImage(image.url)}
                      onBlur={() => setPreviewImage("")}
                      onClick={() => {
                        setActiveImage(image.url);
                        setPreviewImage("");
                      }}
                      type="button"
                      aria-label={`Xem ảnh ${index + 1} của ${product.name}`}
                      aria-pressed={image.url === activeImage}
                    >
                      <img
                        src={resolveImageUrl(image.url)}
                        alt={image.altText ?? product.name}
                        className={`aspect-square w-full object-cover transition duration-500 ${
                          image.url === currentImage ? "scale-[1.05]" : "hover:scale-[1.05]"
                        }`}
                      />
                      <span
                        className={`pointer-events-none absolute inset-0 ring-1 ring-inset transition ${
                          image.url === currentImage ? "ring-[#c39b58]" : "ring-transparent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="self-start">
                <h1 className="text-[34px] font-bold leading-[1.08] tracking-[-0.03em] text-espresso">
                  {product.name}
                </h1>

                <div className="mt-3 flex items-center gap-1 text-[#d5d5d5]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <div className="mt-6 flex items-end gap-2">
                  <span className="text-[24px] font-bold text-[#c39b58]">{formattedPrice}</span>
                  <span className="pb-1 text-[18px] font-bold uppercase tracking-[0.04em] text-[#c39b58]">
                    VND
                  </span>
                </div>

                <div className="mt-6 space-y-2 text-sm text-[#4f4b45]">
                  <p>
                    <span className="font-bold text-espresso">Mã sản phẩm:</span>{" "}
                    <span className="uppercase">{product.sku}</span>
                  </p>
                  <p>
                    <span className="font-bold text-espresso">Danh mục:</span>{" "}
                    <Link to={`/products?category=${product.category.slug}`} className="text-[#c39b58] hover:underline">
                      {product.category.name}
                    </Link>
                  </p>
                  <p>
                    <span className="font-bold text-espresso">Tồn kho:</span> {product.stock} sản phẩm
                  </p>
                </div>

                <p className="mt-6 text-sm leading-7 text-stone">{product.shortDescription}</p>

                <div className="mt-8 flex flex-wrap items-stretch gap-3">
                  <QuantitySelector
                    value={quantity}
                    max={Math.max(1, product.stock)}
                    onChange={setQuantity}
                    variant="square"
                  />
                  <button
                    className="inline-flex h-12 items-center justify-center bg-[#c39b58] px-6 text-sm font-bold uppercase tracking-[0.02em] text-white transition hover:bg-[#b58d4f] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={product.stock <= 0}
                    onClick={() => {
                      addItem(product, quantity);
                      toast.success("Sản phẩm đã được thêm vào giỏ");
                    }}
                  >
                    Thêm giỏ hàng
                  </button>
                  <button
                    className="inline-flex h-12 w-12 items-center justify-center border border-[#e5dbcf] bg-white text-stone transition hover:border-[#c39b58] hover:text-[#c39b58]"
                    onClick={() => toast.success("Đã thêm vào danh sách yêu thích")}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  <button
                    className="inline-flex h-12 w-12 items-center justify-center border border-[#e5dbcf] bg-white text-stone transition hover:border-[#c39b58] hover:text-[#c39b58]"
                    onClick={() => toast.success("Đã lưu để so sánh sản phẩm")}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-bold text-espresso">Chia sẻ:</span>
                  <button className="text-stone transition hover:text-espresso">
                    <MessageCircle className="h-4 w-4" />
                  </button>
                  <button className="text-stone transition hover:text-espresso">
                    <Mail className="h-4 w-4" />
                  </button>
                  <button className="text-stone transition hover:text-espresso">
                    <Link2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-8 grid gap-3 border-t border-[#ece3d7] pt-6 sm:grid-cols-2">
                  <div className="border border-[#ece3d7] bg-[#faf7f2] px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone">Chất liệu</p>
                    <p className="mt-2 text-sm font-medium text-espresso">{product.material}</p>
                  </div>
                  <div className="border border-[#ece3d7] bg-[#faf7f2] px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone">Kích thước</p>
                    <p className="mt-2 text-sm font-medium text-espresso">{product.dimensions}</p>
                  </div>
                  <div className="border border-[#ece3d7] bg-[#faf7f2] px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone">Màu sắc</p>
                    <p className="mt-2 text-sm font-medium text-espresso">{product.color}</p>
                  </div>
                  <div className="border border-[#ece3d7] bg-[#faf7f2] px-4 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-stone">Danh mục</p>
                    <p className="mt-2 text-sm font-medium text-espresso">{product.category.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="shell mt-12">
        <div className="border border-[#ece3d7] bg-white">
          <div className="flex flex-wrap border-b border-[#ece3d7]">
            {[
              { key: "info", label: "Thông tin sản phẩm" },
              { key: "reviews", label: "Đánh giá" },
              { key: "comments", label: "Bình luận" },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-5 py-4 text-sm font-bold uppercase tracking-[0.02em] transition sm:px-6 ${
                  activeTab === tab.key
                    ? "border-b-2 border-[#c39b58] text-[#c39b58]"
                    : "text-espresso hover:text-[#c39b58]"
                }`}
                onClick={() => setActiveTab(tab.key as DetailTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-[#fafafa] px-5 py-6 sm:px-8 sm:py-8">
            {activeTab === "info" ? (
              <div className="space-y-5">
                <div className="space-y-4 text-sm leading-7 text-[#4f4b45]">
                  {(infoParagraphs.length > 0 ? infoParagraphs : [product.description]).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                <div className="grid gap-3 border-t border-[#e8dfd3] pt-5 sm:grid-cols-[220px,1fr]">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <Fragment key={key}>
                      <div className="text-sm font-bold text-espresso">
                        {key}
                      </div>
                      <div className="text-sm leading-7 text-[#4f4b45]">
                        {value}
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            ) : null}

            {activeTab === "reviews" ? (
              <div>
                <h2 className="text-[36px] font-bold tracking-[-0.03em] text-espresso">
                  Khách hàng đánh giá
                </h2>
                <div className="mt-8 grid gap-8 lg:grid-cols-[180px,1fr,280px] lg:items-start">
                  <div className="text-center lg:text-left">
                    <p className="text-[58px] font-bold leading-none text-[#c39b58]">5.0</p>
                    <div className="mt-3 flex justify-center gap-1 text-[#f0b446] lg:justify-start">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-5 w-5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="grid grid-cols-[24px,1fr,34px] items-center gap-3 text-sm text-stone">
                        <span>{star}</span>
                        <div className="h-[8px] bg-[#e7e7e7]" />
                        <span>0%</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm leading-7 text-stone">Chia sẻ nhận xét về sản phẩm</p>
                    <button className="mt-4 inline-flex h-12 items-center justify-center bg-[#111827] px-6 text-sm font-bold text-white transition hover:bg-black">
                      Đánh giá và nhận xét
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {activeTab === "comments" ? (
              <div className="text-sm leading-7 text-stone">
                <p className="font-bold text-espresso">Chưa có bình luận nào cho sản phẩm này.</p>
                <p className="mt-3">
                  Hãy là người đầu tiên để lại câu hỏi hoặc chia sẻ trải nghiệm sử dụng sản phẩm.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="shell mt-20">
        <SectionHeading
          eyebrow="Related Pieces"
          title="Sản phẩm liên quan"
          description="Những thiết kế cùng danh mục và tinh thần vật liệu để bạn dễ phối đồng bộ."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {product.relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </div>
  );
};
