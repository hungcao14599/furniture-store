import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminQueryKeys, publicQueryKeys } from "@/hooks/queryKeys";
import { useAdminProductsQuery } from "@/hooks/useAdminQueries";
import { adminApi } from "@/services/adminApi";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Pagination } from "@/components/Pagination";
import { formatCurrency } from "@/utils/helpers";
import { usePageMeta } from "@/hooks/usePageMeta";

export const ProductsManagementPage = () => {
  usePageMeta("Quản lý sản phẩm", "Danh sách và thao tác CRUD sản phẩm.");

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useAdminProductsQuery(search, page);
  const deleteProductMutation = useMutation({
    mutationFn: adminApi.deleteProduct,
    onSuccess: async () => {
      toast.success("Đã xóa sản phẩm");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.productsRoot() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.productsRoot() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.productRoot() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.home() }),
      ]);
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Không thể xóa sản phẩm");
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải sản phẩm");
    }
  }, [error]);

  const products = data?.items ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Sản phẩm"
        description="Quản lý danh sách nội thất, thông tin tồn kho và thao tác chỉnh sửa sản phẩm đang hiển thị trên website."
        actions={
          <Link className="luxury-button" to="/admin/products/new">
            Thêm sản phẩm
          </Link>
        }
      />

      <div className="surface-panel p-5">
        <div className="flex flex-col gap-4 md:flex-row">
          <input
            className="field flex-1"
            placeholder="Tìm theo tên, SKU hoặc danh mục"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <button
            className="luxury-button"
            onClick={() => {
              setSearch(searchInput);
              if (page === 1) {
                void queryClient.invalidateQueries({
                  queryKey: adminQueryKeys.products({ search: searchInput, page: 1 }),
                });
              } else {
                setPage(1);
              }
            }}
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Đang tải sản phẩm..." />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto p-6">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>SKU</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="font-semibold text-espresso">{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.category.name}</td>
                    <td className="font-semibold text-espresso">{formatCurrency(product.price)}</td>
                    <td>{product.stock}</td>
                    <td>
                      <div className="flex gap-4">
                        <Link className="font-semibold text-espresso" to={`/admin/products/${product.id}/edit`}>
                          Sửa
                        </Link>
                        <button
                          className="font-semibold text-rose-600"
                          onClick={async () => {
                            if (!window.confirm("Xóa sản phẩm này?")) {
                              return;
                            }

                            await deleteProductMutation.mutateAsync(product.id);
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

          <div className="pb-6">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};
