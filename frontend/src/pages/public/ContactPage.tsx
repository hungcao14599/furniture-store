import { Clock3, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useContactInfoQuery } from "@/hooks/usePublicQueries";
import { PageHero } from "@/components/PageHero";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ContactForm } from "@/components/ContactForm";
import { resolveZaloUrl } from "@/utils/helpers";

export const ContactPage = () => {
  usePageMeta(
    "Liên hệ",
    "Thông tin showroom, giờ làm việc và form gửi yêu cầu tư vấn từ Lumina Maison.",
  );

  const { data: contactInfo, isLoading } = useContactInfoQuery();
  const zaloUrl = resolveZaloUrl(contactInfo?.zalo, contactInfo?.phone);

  return (
    <div className="pb-24">
      <PageHero
        eyebrow="Contact"
        title="Liên hệ và đặt lịch tư vấn"
        description="Chia sẻ nhu cầu về không gian, danh mục sản phẩm hoặc thời gian ghé showroom để đội ngũ Lumina Maison hỗ trợ nhanh hơn."
      />

      <section className="shell mt-10 grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
        {isLoading ? (
          <LoadingSpinner label="Đang tải thông tin showroom..." />
        ) : (
          <>
            <div className="space-y-5">
              <div className="surface-panel p-6">
                <h2 className="font-display text-4xl font-semibold text-espresso">Thông tin cửa hàng</h2>
                <div className="mt-6 space-y-4 text-sm leading-7 text-stone">
                  {contactInfo?.address ? (
                    <p className="flex gap-3">
                      <MapPin className="mt-1 h-4 w-4 shrink-0" />
                      <span>{contactInfo.address}</span>
                    </p>
                  ) : null}
                  {contactInfo?.phone ? (
                    <p className="flex gap-3">
                      <Phone className="mt-1 h-4 w-4 shrink-0" />
                      <span>{contactInfo.phone}</span>
                    </p>
                  ) : null}
                  {contactInfo?.email ? (
                    <p className="flex gap-3">
                      <Mail className="mt-1 h-4 w-4 shrink-0" />
                      <span>{contactInfo.email}</span>
                    </p>
                  ) : null}
                  {contactInfo?.workingHours ? (
                    <p className="flex gap-3">
                      <Clock3 className="mt-1 h-4 w-4 shrink-0" />
                      <span>{contactInfo.workingHours}</span>
                    </p>
                  ) : null}
                </div>
                {zaloUrl ? (
                  <a
                    className="mt-6 inline-flex items-center gap-3 rounded-[12px] bg-[#0068ff] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0056d6]"
                    href={zaloUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[11px] font-bold uppercase tracking-[0.04em] text-[#0068ff]">
                      Zalo
                    </span>
                    <span>Liên hệ qua Zalo</span>
                    <MessageCircle className="h-4 w-4" />
                  </a>
                ) : null}
              </div>

              <div className="surface-panel overflow-hidden p-2">
                {contactInfo?.mapEmbedUrl ? (
                  <iframe
                    className="h-[320px] w-full rounded-[22px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={contactInfo.mapEmbedUrl}
                    title="Lumina Maison showroom map"
                  />
                ) : (
                  <div className="flex h-[320px] items-center justify-center rounded-[22px] bg-[#efe3d4] text-sm text-stone">
                    Map placeholder
                  </div>
                )}
              </div>
            </div>

            <ContactForm />
          </>
        )}
      </section>
    </div>
  );
};
