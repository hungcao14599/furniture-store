import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { adminQueryKeys, publicQueryKeys } from "@/hooks/queryKeys";
import { useAdminPostByIdQuery } from "@/hooks/useAdminQueries";
import { adminApi } from "@/services/adminApi";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { usePageMeta } from "@/hooks/usePageMeta";

const initialForm = {
  title: "",
  slug: "",
  excerpt: "",
  coverImage: "",
  authorName: "Lumina Maison Editorial",
  isPublished: true,
  content: "",
};

export const PostFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  usePageMeta(
    isEditing ? "Chỉnh sửa bài viết" : "Thêm bài viết",
    "Form biên tập bài viết theo markdown.",
  );

  const [form, setForm] = useState(initialForm);
  const queryClient = useQueryClient();
  const { data: post, isLoading, error } = useAdminPostByIdQuery(id);
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => adminApi.uploadImages(files),
    onSuccess: (uploaded) => {
      setForm((current) => ({ ...current, coverImage: uploaded[0].url }));
      toast.success("Upload ảnh đại diện thành công");
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Không thể upload ảnh");
    },
  });
  const savePostMutation = useMutation({
    mutationFn: (payload: unknown) => {
      if (isEditing && id) {
        return adminApi.updatePost(id, payload);
      }

      return adminApi.createPost(payload);
    },
    onSuccess: async () => {
      toast.success(isEditing ? "Đã cập nhật bài viết" : "Đã tạo bài viết");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.posts() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.postRoot() }),
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.posts() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.postRoot() }),
        queryClient.invalidateQueries({ queryKey: publicQueryKeys.home() }),
      ]);
      navigate("/admin/posts");
    },
    onError: (mutationError) => {
      toast.error(mutationError instanceof Error ? mutationError.message : "Không thể lưu bài viết");
    },
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        authorName: post.authorName,
        isPublished: post.isPublished,
        content: post.content,
      });
    }
  }, [post]);

  useEffect(() => {
    if (error) {
      toast.error(error instanceof Error ? error.message : "Không thể tải bài viết");
    }
  }, [error]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    await uploadMutation.mutateAsync([files[0]]);
    event.target.value = "";
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.title || !form.coverImage || !form.authorName) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề, tác giả và ảnh đại diện");
      return;
    }

    if (form.excerpt.trim().length < 20 || form.content.trim().length < 80) {
      toast.error("Tóm tắt hoặc nội dung bài viết còn quá ngắn");
      return;
    }

    await savePostMutation.mutateAsync(form);
  };

  if (isEditing && isLoading) {
    return <LoadingSpinner label="Đang tải form bài viết..." />;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={isEditing ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
        description="Biên tập bài viết theo phong cách tối giản, cập nhật ảnh đại diện và trạng thái publish cho phần tin tức."
        actions={
          <Link className="luxury-button-outline" to="/admin/posts">
            Quay lại danh sách
          </Link>
        }
      />

      <form className="surface-card p-6 sm:p-8" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <input
            className="field"
            placeholder="Tiêu đề"
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
          <input
            className="field"
            placeholder="Slug (tùy chọn)"
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          />
          <input
            className="field"
            placeholder="Tác giả"
            value={form.authorName}
            onChange={(event) =>
              setForm((current) => ({ ...current, authorName: event.target.value }))
            }
          />
          <label className="flex items-center gap-3 rounded-[14px] border border-[#e5dbce] bg-[#f8f5ef] px-4 py-3.5 text-sm font-semibold text-espresso">
            <input
              checked={form.isPublished}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({ ...current, isPublished: event.target.checked }))
              }
            />
            Published
          </label>
        </div>

        <textarea
          className="field mt-4 min-h-[120px]"
          placeholder="Tóm tắt bài viết"
          value={form.excerpt}
          onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))}
        />

        <div className="mt-4 rounded-[18px] border border-dashed border-[#d9cbb8] bg-[#fbf8f2] p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-semibold text-espresso">Ảnh đại diện</h3>
              <p className="text-sm text-stone">Dán URL ảnh hoặc upload một ảnh lên Supabase Storage.</p>
            </div>
            <label className="luxury-button-outline cursor-pointer">
              {uploadMutation.isPending ? "Đang upload..." : "Upload ảnh"}
              <input className="hidden" type="file" onChange={handleUpload} />
            </label>
          </div>
          <input
            className="field mt-4"
            placeholder="URL ảnh đại diện"
            value={form.coverImage}
            onChange={(event) =>
              setForm((current) => ({ ...current, coverImage: event.target.value }))
            }
          />
        </div>

        <textarea
          className="field mt-4 min-h-[320px]"
          placeholder="Nội dung markdown"
          value={form.content}
          onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
        />

        <button className="luxury-button mt-6" disabled={savePostMutation.isPending} type="submit">
          {savePostMutation.isPending ? "Đang lưu..." : isEditing ? "Cập nhật bài viết" : "Tạo bài viết"}
        </button>
      </form>
    </div>
  );
};
