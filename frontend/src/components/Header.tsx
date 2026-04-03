import { Mail, Menu, Phone, Search, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ContactInfo } from "@/types/api";
import { useCartStore } from "@/store/cartStore";

const navItems = [
  { label: "Trang chủ", to: "/" },
  { label: "Sản phẩm", to: "/products" },
  { label: "Bài viết", to: "/posts" },
  { label: "Liên hệ", to: "/contact" },
];

type HeaderProps = {
  contactInfo?: ContactInfo | null;
};

export const Header = ({ contactInfo }: HeaderProps) => {
  const [open, setOpen] = useState(false);
  const itemCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );
  const phone = contactInfo?.phone ?? "1900 6680";
  const email = contactInfo?.email ?? "contact@luminamaison.com";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur">
      <div className="hidden border-b border-black/10 bg-[#111111] text-white md:block">
        <div className="shell flex items-center justify-between py-3 text-xs font-semibold uppercase tracking-[0.16em]">
          <div className="flex items-center gap-6">
            <a className="flex items-center gap-2 text-white/90 transition hover:text-white" href={`tel:${phone}`}>
              <Phone className="h-3.5 w-3.5" />
              {phone}
            </a>
            <a
              className="flex items-center gap-2 text-white/90 transition hover:text-white"
              href={`mailto:${email}`}
            >
              <Mail className="h-3.5 w-3.5" />
              {email}
            </a>
          </div>
          <div className="flex items-center gap-6 text-white/70">
            <span>Việt Nam Đồng</span>
            <span>Tiếng Việt</span>
          </div>
        </div>
      </div>

      <div className="border-b border-[#e7decf] bg-white">
        <div className="shell flex items-center justify-between py-5">
          <Link to="/" className="flex flex-col">
            <span className="text-[30px] font-bold uppercase tracking-[0.22em] text-espresso">
              Lumina
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.4em] text-stone">
              Maison
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `border-b-2 pb-1 text-sm font-bold uppercase tracking-[0.14em] transition ${
                    isActive
                      ? "border-espresso text-espresso"
                      : "border-transparent text-stone hover:border-espresso/40 hover:text-espresso"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/products"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#dfd5c8] text-espresso transition hover:bg-mist"
              title="Tìm kiếm sản phẩm"
            >
              <Search className="h-4 w-4" />
            </Link>
            <a
              href={`tel:${phone}`}
              className="hidden rounded-md border border-[#dfd5c8] px-5 py-3 text-sm font-semibold text-espresso transition hover:bg-mist xl:inline-flex"
            >
              Gọi ngay
            </a>
            <Link
              to="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-[#111111] text-white"
              title="Giỏ hàng"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#d4b483] text-[10px] font-bold text-[#111111]">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>

          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[#dfd5c8] text-espresso lg:hidden"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-b border-[#e6ddcf] bg-[#f8f4ee] lg:hidden">
          <div className="shell flex flex-col gap-4 py-5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="text-sm font-bold uppercase tracking-[0.14em] text-espresso"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <a href={`tel:${phone}`} className="text-sm font-semibold text-stone" onClick={() => setOpen(false)}>
              Hotline: {phone}
            </a>
            <Link to="/cart" className="text-sm font-semibold text-stone" onClick={() => setOpen(false)}>
              Giỏ hàng ({itemCount})
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
};
