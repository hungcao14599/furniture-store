import { Facebook, Instagram, Phone, Send, MapPin, Clock3, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactInfo } from "@/types/api";

type FooterProps = {
  contactInfo?: ContactInfo | null;
};

export const Footer = ({ contactInfo }: FooterProps) => {
  return (
    <footer className="mt-24 bg-[#111111] text-white">
      <div className="shell grid gap-10 py-16 lg:grid-cols-[1.2fr,0.8fr,0.8fr,0.9fr]">
        <div>
          <span className="block text-2xl font-bold uppercase tracking-[0.22em]">Lumina Maison</span>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/72">
            Nội thất hiện đại theo tinh thần tối giản ấm áp, tối ưu cho căn hộ, villa và không
            gian sống đề cao công năng.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-white">Điều hướng</h3>
          <div className="mt-5 space-y-3 text-sm text-white/72">
            <Link className="block transition hover:text-white" to="/">
              Trang chủ
            </Link>
            <Link className="block transition hover:text-white" to="/products">
              Sản phẩm
            </Link>
            <Link className="block transition hover:text-white" to="/posts">
              Bài viết
            </Link>
            <Link className="block transition hover:text-white" to="/contact">
              Liên hệ
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-white">Chính sách</h3>
          <div className="mt-5 space-y-3 text-sm text-white/72">
            <span className="block">Chính sách bảo mật</span>
            <span className="block">Chính sách vận chuyển</span>
            <span className="block">Chính sách bảo hành</span>
            <Link className="block transition hover:text-white" to="/admin/login">
              Khu vực admin
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-white">Thông tin</h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-white/72">
            {contactInfo?.address ? (
              <p className="flex gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-white" />
                <span>{contactInfo.address}</span>
              </p>
            ) : null}
            {contactInfo?.phone ? (
              <p className="flex gap-3">
                <Phone className="mt-1 h-4 w-4 shrink-0 text-white" />
                <span>{contactInfo.phone}</span>
              </p>
            ) : null}
            {contactInfo?.email ? (
              <p className="flex gap-3">
                <Mail className="mt-1 h-4 w-4 shrink-0 text-white" />
                <span>{contactInfo.email}</span>
              </p>
            ) : null}
            {contactInfo?.workingHours ? (
              <p className="flex gap-3">
                <Clock3 className="mt-1 h-4 w-4 shrink-0 text-white" />
                <span>{contactInfo.workingHours}</span>
              </p>
            ) : null}
            <div className="flex items-center gap-3 pt-2">
              {contactInfo?.facebook ? (
                <a
                  className="rounded-full border border-white/15 p-2 text-white"
                  href={contactInfo.facebook}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              ) : null}
              {contactInfo?.instagram ? (
                <a
                  className="rounded-full border border-white/15 p-2 text-white"
                  href={contactInfo.instagram}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Instagram className="h-4 w-4" />
                </a>
              ) : null}
              {contactInfo?.zalo ? (
                <a
                  className="rounded-full border border-white/15 p-2 text-white"
                  href={contactInfo.zalo}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Send className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="shell py-5 text-sm text-white/55">
          © 2026 Lumina Maison. Contemporary furniture for refined living.
        </div>
      </div>
    </footer>
  );
};
