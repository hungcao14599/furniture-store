import {
  ArrowRight,
  Check,
  PhoneCall,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHomePageQuery } from "@/hooks/usePublicQueries";
import { usePageMeta } from "@/hooks/usePageMeta";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { SectionHeading } from "@/components/SectionHeading";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { PostCard } from "@/components/PostCard";
import { ContactForm } from "@/components/ContactForm";
import { resolveImageUrl } from "@/utils/helpers";

const heroSlides = [
  {
    title: "Nội thất hiện đại cho không gian sống thanh lịch",
    description:
      "Tối giản, ấm áp và thực dụng là ba lớp ngôn ngữ chủ đạo cho mọi bộ sưu tập của Lumina Maison.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Bố cục gọn gàng, vật liệu ấm và cảm giác sống dễ chịu",
    description:
      "Từ sofa, bàn ăn đến giường ngủ và đèn trang trí, mọi sản phẩm đều hướng tới sự hài hòa tổng thể.",
    image:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Giải pháp nội thất trọn bộ cho căn hộ, villa và nhà phố",
    description:
      "Đề cao công năng sử dụng hàng ngày nhưng vẫn giữ được vẻ sang trọng, sạch sẽ và đúng tinh thần boutique.",
    image:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  },
];

const serviceHighlights = [
  {
    title: "Tư vấn nhanh",
    description:
      "Phản hồi nhu cầu trong 24h và gợi ý danh mục phù hợp theo không gian thực tế.",
    icon: PhoneCall,
  },
  {
    title: "Giao hàng toàn quốc",
    description:
      "Đóng gói an toàn, theo dõi đơn rõ ràng và hỗ trợ lắp đặt với các đơn phù hợp.",
    icon: Truck,
  },
  {
    title: "Bảo hành minh bạch",
    description:
      "Thông tin chất liệu, kích thước, tồn kho và chế độ hậu mãi được hiển thị rõ ràng.",
    icon: ShieldCheck,
  },
];

export const HomePage = () => {
  usePageMeta(
    "Nội thất cao cấp cho không gian sống hiện đại",
    "Khám phá sofa, bàn ăn, giường ngủ, đèn trang trí và bộ sưu tập nội thất cao cấp tại Lumina Maison.",
  );

  const [activeHero, setActiveHero] = useState(0);
  const { data, isLoading, error } = useHomePageQuery();

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroSlides.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  if (isLoading) {
    return (
      <LoadingSpinner label="Đang chuẩn bị không gian sống từ Lumina Maison..." />
    );
  }

  if (error || !data) {
    return (
      <div className="shell py-20">
        <div className="surface-card px-8 py-14 text-center">
          <h1 className="text-4xl font-bold text-espresso">
            Không thể tải trang chủ
          </h1>
          <p className="mt-4 text-sm leading-7 text-stone">
            {error instanceof Error ? error.message : "Không thể tải dữ liệu trang chủ"}
          </p>
          <button
            className="luxury-button mt-6"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const { categories, featuredProducts, bestSellerProducts, latestProducts, posts, contactInfo } =
    data;

  return (
    <div>
      <section className="relative min-h-[640px] overflow-hidden border-b border-[#e7ddcf] bg-[#111111] text-white">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeHero ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
          </div>
        ))}

        <div className="shell relative flex min-h-[640px] flex-col justify-center py-20">
          <div className="max-w-3xl animate-rise">
            <span className="inline-flex rounded-md border border-white/20 bg-white/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90">
              Mẫu giao diện tham chiếu noithat09
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-[-0.04em] text-white md:text-6xl lg:text-7xl">
              {heroSlides[activeHero].title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 md:text-lg">
              {heroSlides[activeHero].description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/products"
                className="bg-white text-black !hover:text-white !hover:bg-white/10 inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold transition "
              >
                Khám phá sản phẩm
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Yêu cầu tư vấn
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.title}
                  className={`h-2.5 rounded-md transition-all ${
                    index === activeHero ? "w-14 bg-white" : "w-8 bg-white/35"
                  }`}
                  onClick={() => setActiveHero(index)}
                />
              ))}
            </div>
          </div>

          <div className="relative mt-12 grid gap-4 md:grid-cols-3">
            {serviceHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-[12px] border border-white/10 bg-white/10 p-5 backdrop-blur"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-white/15">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/78">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative z-10 shell -mt-10">
        <div className="surface-card px-6 py-8 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { value: "120+", label: "Mẫu nội thất nổi bật" },
              { value: "24h", label: "Phản hồi tư vấn" },
              { value: "36m", label: "Bảo hành kết cấu" },
              { value: "7 ngày", label: "Giao hàng linh hoạt" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[12px] bg-[#f8f4ee] px-5 py-4"
              >
                <p className="text-3xl font-bold text-espresso">{item.value}</p>
                <p className="mt-2 text-sm text-stone">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell mt-24">
        <div className="rounded-[26px] border border-[#e6ddd1] bg-[linear-gradient(180deg,#fdfbf8_0%,#f6f1e9_100%)] px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex flex-col gap-6 border-b border-[#e8dfd3] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Danh mục nổi bật"
              title="Nhóm sản phẩm được quan tâm nhiều nhất"
              description="Sắp xếp lại theo kiểu catalogue rõ ràng hơn: ảnh lớn, nội dung ngắn gọn và khoảng thở tốt để người xem quét nhanh từng nhóm sản phẩm."
              titleVariant="sans"
            />

            <div className="grid max-w-[360px] gap-3 sm:grid-cols-2 lg:min-w-[320px] lg:max-w-none">
              <div className="rounded-[16px] border border-[#e8dfd3] bg-white px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone">
                  Danh mục
                </p>
                <p className="mt-2 text-[30px] font-bold tracking-[-0.04em] text-espresso">
                  {Math.min(categories.length, 6)}
                </p>
              </div>
              <div className="rounded-[16px] border border-[#e8dfd3] bg-white px-5 py-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-stone">
                  Trọng tâm
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-espresso">
                  Bố cục hiện đại, dễ nhìn và rõ CTA hơn
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.slice(0, 6).map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="shell mt-24">
        <SectionHeading
          eyebrow="Sản phẩm nổi bật"
          title="Sản Phẩm Nổi Bật"
          description="Những thiết kế bán chạy cho phòng khách và phòng ăn, theo hướng trình bày sáng, rõ và hiện đại."
          align="center"
          titleVariant="sans"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="shell mt-24 grid gap-10 lg:grid-cols-[1.05fr,0.95fr]">
        <div className="overflow-hidden rounded-[14px]">
          <img
            src="https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80"
            alt="Showroom nội thất hiện đại"
            className="h-full min-h-[420px] w-full object-cover"
          />
        </div>
        <div className="surface-panel p-8 sm:p-10">
          <SectionHeading
            eyebrow="Giới thiệu thương hiệu"
            title="Không gian đúng tinh thần hiện đại, ấm và dễ sống"
            description="Website tham chiếu ưu tiên cảm giác sạch sẽ, đậm chất bán hàng ngành nội thất. Chúng tôi giữ tinh thần đó bằng nền trắng, các mảng be nhẹ, headline rõ và card công năng."
            titleVariant="sans"
          />
          <div className="mt-8 space-y-4">
            {[
              "Tư vấn phối tổng thể cho căn hộ, villa và showroom nội thất.",
              "Ưu tiên vật liệu gỗ, vải, kim loại sơn tĩnh điện và bề mặt trung tính.",
              "Thiết kế danh mục rõ, chuyển hướng nhanh và dễ đặt hàng từ mobile đến desktop.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[12px] bg-white p-4"
              >
                <div className="rounded-md bg-sand p-2 text-espresso">
                  <Check className="h-4 w-4" />
                </div>
                <p className="text-sm leading-7 text-stone">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell mt-24">
        <SectionHeading
          eyebrow="Best seller"
          title="Sản phẩm được lựa chọn nhiều nhất"
          description="Giữ cùng hệ thống card và khoảng trắng để toàn bộ trang nhất quán về thị giác."
          align="center"
          titleVariant="sans"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {bestSellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="shell mt-24">
        <SectionHeading
          eyebrow="Sản phẩm mới"
          title="Cập nhật mới cho bộ sưu tập hiện tại"
          description="Những thiết kế mới nhất được đưa lên theo cùng hệ visual của toàn site."
          align="center"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {latestProducts.slice(0, 3).map((product) => (
            <article
              key={product.id}
              className="surface-card overflow-hidden p-4"
            >
              <img
                src={resolveImageUrl(product.images[0]?.url)}
                alt={product.name}
                className="h-72 w-full rounded-[10px] object-cover"
              />
              <div className="px-2 pb-2 pt-5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
                  <Star className="h-4 w-4 fill-[#c69d63] text-[#c69d63]" />
                  New Arrival
                </div>
                <h3 className="mt-3 text-xl font-bold text-espresso">
                  {product.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-stone">
                  {product.shortDescription}
                </p>
                <Link
                  to={`/products/${product.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-espresso"
                >
                  Xem sản phẩm
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="shell mt-24">
        <SectionHeading
          eyebrow="Bài viết nội thất"
          title="Tin tức và cảm hứng bố trí không gian"
          description="Card bài viết được tinh chỉnh theo cùng nhịp với trang chủ: ảnh lớn, khoảng trắng rộng, CTA rõ."
          align="center"
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </section>

      <section className="shell mt-24 pb-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
          <div className="rounded-[14px] bg-[#111111] p-8 text-white sm:p-10">
            <span className="inline-flex rounded-md border border-white/15 bg-white/10 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
              Liên hệ nhanh
            </span>
            <h2 className="mt-5 text-4xl font-bold tracking-[-0.03em] text-white md:text-5xl">
              Nhận tư vấn theo đúng phong cách không gian của bạn
            </h2>
            <p className="mt-5 text-sm leading-8 text-white/78">
              Gửi yêu cầu nhanh để nhận gợi ý về danh mục phù hợp, cách phối và
              thời gian giao hàng.
            </p>
            <div className="mt-8 space-y-4 text-sm leading-7 text-white/78">
              {contactInfo?.phone ? (
                <p>Số điện thoại: {contactInfo.phone}</p>
              ) : null}
              {contactInfo?.email ? <p>Email: {contactInfo.email}</p> : null}
              {contactInfo?.address ? (
                <p>Showroom: {contactInfo.address}</p>
              ) : null}
            </div>
          </div>
          <ContactForm compact />
        </div>
      </section>
    </div>
  );
};
