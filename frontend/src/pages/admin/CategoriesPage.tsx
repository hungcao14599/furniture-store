import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { adminQueryKeys, publicQueryKeys } from "@/hooks/queryKeys";
import { useAdminCategoriesQuery } from "@/hooks/useAdminQueries";
import { adminApi } from "@/services/adminApi";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { usePageMeta } from "@/hooks/usePageMeta";

const initialForm = {
  name: "",
  slug: "",
  description: "",
  image: "",
};

export const CategoriesPage = () => {
  usePageMeta("Quản lý danh mục", "Thêm, sửa, xóa danh mục sản phẩm.");

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading, error } = useAdminCategoriesQuery();
  const saveCategoryMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        return adminApi.updateCategory(editingId, form);
      }

      return adminApi.createCategory(form);
    },
    onSuccess: async () => {
      toast.success(editingId ? "Đã cập nhật danh mục" : "Đã tạo danh mục");
      resetForm();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.categories() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.home() }),
      ]);
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Không thể lưu danh mục");
    },
  });
  const deleteCategoryMutation = useMutation({
    mutationFn: adminApi.deleteCategory,
    onSuccess: async (_, deletedId) => {
      toast.success("Đã xóa danh mục");
      if (editingId === deletedId) {
        resetForm();
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.categories() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.categories() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.home() }),
      ]);
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Không thể xóa danh mục");
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải danh mục");
    }
  }, [error]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (form.name.trim().length < 2) {
      toast.error("Tên danh mục phải có ít nhất 2 ký tự");
      return;
    }

    await saveCategoryMutation.mutateAsync();
  };

  if (isLoading) {
    return <LoadingSpinner label="Đang tải danh mục..." />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Danh mục sản phẩm"
        description="Thêm, cập nhật và sắp xếp các nhóm nội thất để phần điều hướng ở website bán hàng luôn rõ ràng."
      />

      <div className="grid gap-8 lg:grid-cols-[0.9fr,1.1fr]">
        <form className="surface-card p-6" onSubmit={handleSubmit}>
          <h2 className="text-[28px] font-bold tracking-[-0.03em] text-espresso">
            {editingId ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
          </h2>
          <div className="mt-6 space-y-4">
            <input
              className="field"
              placeholder="Tên danh mục"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <input
              className="field"
              placeholder="Slug (tùy chọn)"
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            />
            <input
              className="field"
              placeholder="URL ảnh đại diện"
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
            />
            <textarea
              className="field min-h-[140px]"
              placeholder="Mô tả danh mục"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="luxury-button" disabled={saveCategoryMutation.isPending} type="submit">
              {saveCategoryMutation.isPending ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo danh mục"}
            </button>
            {editingId ? (
              <button className="luxury-button-outline" onClick={resetForm} type="button">
                Hủy
              </button>
            ) : null}
          </div>
        </form>

        <div className="surface-card overflow-hidden">
          <div className="border-b border-[#efe3d4] px-6 py-5">
            <h2 className="text-[28px] font-bold tracking-[-0.03em] text-espresso">Danh sách danh mục</h2>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th>Sản phẩm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="font-semibold text-espresso">{category.name}</td>
                    <td>{category.slug}</td>
                    <td>{category._count?.products ?? 0}</td>
                    <td>
                      <div className="flex gap-4">
                        <button
                          className="font-semibold text-espresso"
                          onClick={() => {
                            setEditingId(category.id);
                            setForm({
                              name: category.name,
                              slug: category.slug,
                              description: category.description ?? "",
                              image: category.image ?? "",
                            });
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          className="font-semibold text-rose-600"
                          onClick={async () => {
                            if (!window.confirm("Xóa danh mục này?")) {
                              return;
                            }

                            await deleteCategoryMutation.mutateAsync(category.id);
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
