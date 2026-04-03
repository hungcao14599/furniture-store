import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderTree,
  Package,
  PenSquare,
  PhoneCall,
  MessageSquare,
  Receipt,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAdminMeQuery } from "@/hooks/useAdminQueries";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const adminLinks = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
  { label: "Danh mục", to: "/admin/categories", icon: FolderTree },
  { label: "Sản phẩm", to: "/admin/products", icon: Package },
  { label: "Bài viết", to: "/admin/posts", icon: PenSquare },
  { label: "Đơn hàng", to: "/admin/orders", icon: Receipt },
  { label: "Liên hệ cửa hàng", to: "/admin/contact-info", icon: PhoneCall },
  { label: "Form liên hệ", to: "/admin/contact-messages", icon: MessageSquare },
];

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, token, setAuth, clearAuth } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const shouldFetchMe = Boolean(token && !admin);
  const meQuery = useAdminMeQuery(shouldFetchMe);

  useEffect(() => {
    if (token && meQuery.data) {
      setAuth(token, meQuery.data);
    }
  }, [meQuery.data, setAuth, token]);

  useEffect(() => {
    if (shouldFetchMe && meQuery.error) {
      queryClient.clear();
      clearAuth();
      navigate("/admin/login");
    }
  }, [clearAuth, meQuery.error, navigate, shouldFetchMe]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (shouldFetchMe && meQuery.isLoading) {
    return <LoadingSpinner label="Đang xác thực phiên quản trị..." />;
  }

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-espresso">
      <div className="grid min-h-screen lg:grid-cols-[286px,1fr]">
        {mobileOpen ? (
          <button
            aria-label="Đóng menu"
            className="fixed inset-0 z-30 bg-black/35 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[286px] max-w-[calc(100vw-28px)] flex-col border-r border-[#e9dfd2] bg-[#fbfaf7] px-5 py-5 transition-transform duration-300 lg:static lg:w-auto lg:max-w-none ${
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <Link to="/admin" className="block">
              <span className="text-[30px] font-bold uppercase tracking-[0.22em] text-espresso">
                Lumina
              </span>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
                Admin Studio
              </p>
            </Link>
            <button
              aria-label="Đóng menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e6ddd1] bg-white text-espresso lg:hidden"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 rounded-[18px] border border-[#e7ddd1] bg-[#f7f3ec] p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
              Đang đăng nhập
            </p>
            <p className="mt-3 text-base font-semibold text-espresso">{admin?.fullName}</p>
            <p className="mt-1 text-sm text-stone">{admin?.email}</p>
          </div>

          <div className="mt-8">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
              Điều hướng
            </p>
            <nav className="mt-3 space-y-1.5">
              {adminLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/admin"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-[14px] border px-4 py-3.5 text-sm font-semibold transition ${
                        isActive
                          ? "border-[#e4d9cb] bg-[#f7f3ec] text-espresso shadow-soft"
                          : "border-transparent text-stone hover:border-[#ece2d6] hover:bg-white hover:text-espresso"
                      }`
                    }
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ece2d6] bg-white">
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <button
            className="mt-auto inline-flex items-center gap-2 rounded-[12px] px-3 py-3 text-sm font-semibold text-stone transition hover:bg-white hover:text-espresso"
            onClick={() => {
              clearAuth();
              navigate("/admin/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[#e9dfd2] bg-[#fbfaf7]/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  aria-label="Mở menu"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#e6ddd1] bg-white text-espresso lg:hidden"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
                    Lumina Maison
                  </p>
                  <p className="truncate text-sm font-semibold text-espresso">
                    Bảng quản trị showroom
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  className="hidden items-center gap-2 rounded-[12px] border border-[#ddd2c5] bg-white px-4 py-2.5 text-sm font-semibold text-espresso transition hover:bg-[#f8f5ef] sm:inline-flex"
                  to="/"
                >
                  Xem website
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <div className="hidden rounded-[12px] border border-[#e7ddd1] bg-white px-4 py-2.5 text-right sm:block">
                  <p className="text-sm font-semibold text-espresso">{admin?.fullName}</p>
                  <p className="text-xs text-stone">{admin?.email}</p>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-[1320px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
