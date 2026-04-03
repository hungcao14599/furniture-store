import { useMutation } from "@tanstack/react-query";
import { FormEvent, useState } from "react";
import { ArrowUpRight, MessageSquare, Package, PenSquare, Receipt } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { adminQueryKeys } from "@/hooks/queryKeys";
import { queryClient } from "@/lib/queryClient";
import { adminApi } from "@/services/adminApi";
import { useAuthStore } from "@/store/authStore";
import { usePageMeta } from "@/hooks/usePageMeta";

export const AdminLoginPage = () => {
  usePageMeta("Admin Login", "Đăng nhập khu vực quản trị Lumina Maison.");

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ email: "", password: "" });
  const loginMutation = useMutation({
    mutationFn: adminApi.login,
    onSuccess: (data) => {
      setAuth(data.token, data.admin);
      queryClient.setQueryData(adminQueryKeys.me(), data.admin);
      toast.success("Đăng nhập thành công");

      const redirectPath =
        (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/admin";
      navigate(redirectPath, { replace: true });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại");
    },
  });

  const highlights = [
    { label: "Sản phẩm", value: "Quản lý danh mục và tồn kho", icon: Package },
    { label: "Đơn hàng", value: "Theo dõi trạng thái giao vận", icon: Receipt },
    { label: "Nội dung", value: "Biên tập bài viết và liên hệ", icon: PenSquare },
  ];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    await loginMutation.mutateAsync(form);
  };

  return (
    <div className="min-h-screen bg-[#f6f3ec] px-4 py-6 sm:py-10">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border border-[#e7ddd1] bg-white shadow-luxe lg:grid-cols-[1.08fr,0.92fr]">
        <div className="border-b border-[#e8ddd0] bg-[linear-gradient(180deg,#fbfaf7_0%,#f4efe7_100%)] p-8 sm:p-10 lg:border-b-0 lg:border-r lg:p-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
                Lumina Maison
              </p>
              <p className="mt-2 text-[28px] font-bold uppercase tracking-[0.2em] text-espresso">
                Admin
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-[12px] border border-[#ddd2c5] bg-white px-4 py-2.5 text-sm font-semibold text-espresso transition hover:bg-[#f8f5ef]"
              to="/"
            >
              Xem website
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 max-w-xl">
            <span className="eyebrow">Admin Portal</span>
            <h1 className="mt-5 text-4xl font-bold tracking-[-0.04em] text-espresso sm:text-5xl">
              Điều hành showroom trong một không gian quản trị thống nhất.
            </h1>
            <p className="mt-5 text-sm leading-8 text-stone">
              Theo dõi sản phẩm, đơn hàng, bài viết và phản hồi khách hàng với cùng một hệ giao
              diện đồng bộ với website bán hàng.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[18px] border border-[#e7ddd1] bg-white p-5">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#ece2d6] bg-[#f7f3ec]">
                    <Icon className="h-5 w-5 text-espresso" />
                  </span>
                  <p className="mt-4 text-sm font-bold text-espresso">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-stone">{item.value}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-[#e7ddd1] bg-white p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#ece2d6] bg-[#f7f3ec]">
              <MessageSquare className="h-5 w-5 text-espresso" />
            </span>
            <div>
              <p className="text-sm font-bold text-espresso">Trải nghiệm đồng bộ với public site</p>
              <p className="mt-2 text-sm leading-7 text-stone">
                Font chữ, tone màu và nhịp spacing của trang quản trị đã được kéo về cùng phong
                cách với giao diện khách hàng để sản phẩm nhìn nhất quán hơn.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 lg:p-12">
          <span className="eyebrow">Đăng nhập</span>
          <h2 className="mt-5 text-[34px] font-bold tracking-[-0.04em] text-espresso sm:text-[40px]">
            Khu vực quản trị
          </h2>
          <p className="mt-3 text-sm leading-7 text-stone">
            Sử dụng tài khoản admin để truy cập dashboard và vận hành toàn bộ website.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <input
              className="field"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            />
            <input
              className="field"
              placeholder="Mật khẩu"
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({ ...current, password: event.target.value }))
              }
            />
            <button
              className="luxury-button mt-2 w-full"
              disabled={loginMutation.isPending}
              type="submit"
            >
              {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập quản trị"}
            </button>
          </form>

          <div className="mt-6 rounded-[18px] border border-[#e7ddd1] bg-[#fbfaf7] p-5 text-sm leading-7 text-stone">
            <p className="font-semibold text-espresso">Gợi ý sử dụng</p>
            <p className="mt-2">
              Sau khi đăng nhập, bạn có thể vào nhanh các mục quản lý sản phẩm, bài viết, đơn hàng
              và thông tin liên hệ ngay từ thanh điều hướng bên trái.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
