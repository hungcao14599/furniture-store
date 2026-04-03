import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { usePostBySlugQuery } from "@/hooks/usePublicQueries";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { formatDate, resolveImageUrl } from "@/utils/helpers";

export const PostDetailPage = () => {
  const { slug } = useParams();
  const { data: post, isLoading, error } = usePostBySlugQuery(slug);

  usePageMeta(
    post?.title ?? "Chi tiết bài viết",
    post?.excerpt ?? "Bài viết nội thất từ Lumina Maison.",
  );

  if (isLoading) {
    return <LoadingSpinner label="Đang tải nội dung bài viết..." />;
  }

  if (!post || error) {
    return (
      <div className="shell py-20">
        <div className="surface-card px-8 py-14 text-center">
          <h1 className="font-display text-4xl font-semibold text-espresso">Không tìm thấy bài viết</h1>
          <p className="mt-4 text-sm leading-7 text-stone">
            {error instanceof Error ? error.message : "Bài viết không tồn tại."}
          </p>
          <Link className="luxury-button mt-6" to="/posts">
            Quay lại danh sách bài viết
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="shell py-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm text-stone">
          <Link to="/posts" className="hover:text-espresso">
            Journal
          </Link>{" "}
          / {formatDate(post.publishedAt)}
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-espresso md:text-6xl">
          {post.title}
        </h1>
        <p className="mt-5 text-base leading-8 text-stone">{post.excerpt}</p>
        <img
          src={resolveImageUrl(post.coverImage)}
          alt={post.title}
          className="mt-10 h-[420px] w-full rounded-[30px] object-cover md:h-[560px]"
        />
        <div className="markdown-body mt-10">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
};
