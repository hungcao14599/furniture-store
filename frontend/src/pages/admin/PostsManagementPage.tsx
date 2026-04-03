import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { adminQueryKeys, publicQueryKeys } from "@/hooks/queryKeys";
import { useAdminPostsQuery } from "@/hooks/useAdminQueries";
import { adminApi } from "@/services/adminApi";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDate } from "@/utils/helpers";
import { usePageMeta } from "@/hooks/usePageMeta";

export const PostsManagementPage = () => {
  usePageMeta("Quản lý bài viết", "Danh sách bài viết và thao tác CRUD nội dung.");

  const queryClient = useQueryClient();
  const { data: posts = [], isLoading, error } = useAdminPostsQuery();
  const deletePostMutation = useMutation({
    mutationFn: adminApi.deletePost,
    onSuccess: async () => {
      toast.success("Đã xóa bài viết");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.posts() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.posts() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.postRoot() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.home() }),
      ]);
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Không thể xóa bài viết");
    },
  });

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải bài viết");
    }
  }, [error]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Bài viết"
        description="Quản lý các bài viết tư vấn, xu hướng thiết kế và nội dung marketing xuất hiện ở phần tin tức."
        actions={
          <Link className="luxury-button" to="/admin/posts/new">
            Thêm bài viết
          </Link>
        }
      />

      {isLoading ? (
        <LoadingSpinner label="Đang tải bài viết..." />
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto p-6">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Slug</th>
                  <th>Ngày publish</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className="font-semibold text-espresso">{post.title}</td>
                    <td>{post.slug}</td>
                    <td>{formatDate(post.publishedAt)}</td>
                    <td>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          post.isPublished
                            ? "border-[#cfe5d7] bg-[#eef9f2] text-[#1f6a43]"
                            : "border-[#ead8b5] bg-[#fff6e3] text-[#8f6513]"
                        }`}
                      >
                        {post.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-4">
                        <Link className="font-semibold text-espresso" to={`/admin/posts/${post.id}/edit`}>
                          Sửa
                        </Link>
                        <button
                          className="font-semibold text-rose-600"
                          onClick={async () => {
                            if (!window.confirm("Xóa bài viết này?")) {
                              return;
                            }

                            await deletePostMutation.mutateAsync(post.id);
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
      )}
    </div>
  );
};
