import { usePageMeta } from "@/hooks/usePageMeta";
import { usePostsQuery } from "@/hooks/usePublicQueries";
import { PageHero } from "@/components/PageHero";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostCard } from "@/components/PostCard";

export const PostsPage = () => {
  usePageMeta(
    "Bài viết nội thất",
    "Xu hướng thiết kế, mẹo bài trí và cảm hứng không gian sống từ Lumina Maison.",
  );

  const { data: posts = [], isLoading, error } = usePostsQuery();

  return (
    <div className="pb-24">
      <PageHero
        eyebrow="Journal"
        title="Bài viết và xu hướng thiết kế"
        description="Gợi ý phối vật liệu, cách chọn tỷ lệ nội thất và những xu hướng đang được ưa chuộng trong không gian sống hiện đại."
      />

      <section className="shell mt-10">
        {isLoading ? <LoadingSpinner label="Đang tải bài viết..." /> : null}
        {!isLoading && error ? (
          <div className="surface-card px-6 py-12 text-center text-sm text-stone">
            {error instanceof Error ? error.message : "Không thể tải bài viết"}
          </div>
        ) : null}
        {!isLoading && !error ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
};
