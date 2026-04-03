import { Check, ExternalLink, QrCode, ScanLine, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ContactInfo } from "@/types/api";
import { buildQrCodeUrl, resolveZaloUrl } from "@/utils/helpers";

type FloatingContactActionsProps = {
  contactInfo?: ContactInfo | null;
};

export const FloatingContactActions = ({ contactInfo }: FloatingContactActionsProps) => {
  const [open, setOpen] = useState(false);
  const zaloUrl = resolveZaloUrl(contactInfo?.zalo, contactInfo?.phone);
  const qrCodeUrl = buildQrCodeUrl(zaloUrl);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  if (!zaloUrl) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-5 right-4 z-[60] sm:bottom-6 sm:right-6">
        <button
          className="group inline-flex items-center gap-3 rounded-full border border-[#cfe2ff] bg-white/96 px-3 py-3 text-[#005ae0] shadow-[0_20px_44px_rgba(0,104,255,0.2)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_28px_54px_rgba(0,104,255,0.24)]"
          onClick={() => setOpen(true)}
          title="Mở mã QR Zalo"
          type="button"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0b8dff,#0052ff)] text-sm font-bold uppercase tracking-[0.04em] text-white">
            <span className="absolute inset-0 rounded-full bg-[#0068ff] opacity-30 blur-md" />
            <span className="relative">Zalo</span>
          </span>
          <span className="hidden flex-col items-start pr-1 sm:flex">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6ea2ff]">Liên hệ nhanh</span>
            <span className="text-sm font-semibold text-[#005ae0]">Quét QR Zalo</span>
          </span>
          <ScanLine className="hidden h-4 w-4 transition group-hover:translate-x-0.5 sm:block" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#111111]/60 px-4 py-6 backdrop-blur-[2px]">
          <button className="absolute inset-0" onClick={() => setOpen(false)} type="button" />

          <div className="relative w-full max-w-[460px] overflow-hidden rounded-[32px] border border-white/70 bg-[#f7fbff] shadow-[0_36px_90px_rgba(0,0,0,0.24)] sm:max-w-[620px]">
            <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0d87ff_0%,#005df5_55%,#004ee1_100%)] px-6 pb-24 pt-6 text-white sm:px-8 sm:pb-20">
              <div className="absolute -right-10 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute right-24 top-2 h-20 w-20 rounded-full bg-white/10 blur-xl" />
              <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/10 blur-xl" />
              <button
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/16 bg-white/12 text-white transition hover:bg-white/22"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative flex items-start gap-4 pr-12">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white text-sm font-bold uppercase tracking-[0.04em] text-[#0068ff] shadow-[0_12px_24px_rgba(255,255,255,0.18)]">
                  Zalo
                </div>
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
                    <QrCode className="h-3.5 w-3.5" />
                    Quét để liên hệ
                  </div>
                  <h3 className="mt-3 text-[28px] font-bold leading-tight tracking-[-0.03em] text-white sm:text-[34px]">
                    Zalo Lumina Maison
                  </h3>
                  <p className="mt-2 max-w-[380px] text-sm leading-6 text-white/78 sm:text-[15px]">
                    Kết nối nhanh với showroom để tư vấn sản phẩm, đặt lịch và nhận báo giá.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="-mt-[72px] rounded-[28px] bg-white p-4 shadow-[0_28px_60px_rgba(0,64,180,0.14)] sm:p-5">
                <div className="grid gap-4 sm:grid-cols-[270px,1fr] sm:items-stretch">
                  <div className="rounded-[24px] bg-[linear-gradient(180deg,#f6f9ff_0%,#eef4ff_100%)] p-4">
                    <div className="rounded-[20px] bg-white p-4 shadow-[inset_0_0_0_1px_rgba(0,104,255,0.06)]">
                      <img
                        alt="QR liên hệ Zalo"
                        className="mx-auto h-[220px] w-[220px] rounded-[14px] bg-white object-cover sm:h-[238px] sm:w-[238px]"
                        src={qrCodeUrl}
                      />
                    </div>
                    <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-[#dce8ff] bg-white/80 px-4 py-3 text-sm font-semibold text-[#005df5]">
                      <ScanLine className="h-4 w-4" />
                      Quét mã QR bằng Zalo
                    </div>
                  </div>

                  <div className="flex flex-col justify-between rounded-[24px] border border-[#edf1f6] bg-[linear-gradient(180deg,#fcfdff_0%,#f4f8ff_100%)] p-5">
                    <div>
                      <p className="text-[16px] font-semibold leading-7 text-espresso">
                        Mở Zalo trên điện thoại và quét mã để bắt đầu trò chuyện.
                      </p>
                      <div className="mt-4 grid gap-3 text-sm text-stone">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e9f2ff] text-[#005df5]">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span>Mở ứng dụng Zalo rồi dùng tính năng quét QR.</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#e9f2ff] text-[#005df5]">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span>Nếu đang ở điện thoại, bạn có thể bấm mở Zalo trực tiếp.</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      <a
                        className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(135deg,#0b84ff,#0058f0)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(0,104,255,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_38px_rgba(0,104,255,0.26)]"
                        href={zaloUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Mở Zalo trực tiếp
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-[#d9e4f8] bg-white px-5 py-3.5 text-sm font-semibold text-espresso transition hover:bg-[#f8fbff]"
                        onClick={() => setOpen(false)}
                        type="button"
                      >
                        Đóng cửa sổ
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
