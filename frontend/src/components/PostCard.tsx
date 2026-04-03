import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Post } from "@/types/api";
import { formatDate, resolveImageUrl } from "@/utils/helpers";

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <article className="rounded-[12px] border border-[#e7ddcf] bg-white p-4 shadow-soft">
      <Link to={`/posts/${post.slug}`} className="block overflow-hidden rounded-[10px]">
        <img
          src={resolveImageUrl(post.coverImage)}
          alt={post.title}
          className="h-72 w-full object-cover transition duration-700 hover:scale-105"
        />
      </Link>
      <div className="px-2 pb-2 pt-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone">
          {formatDate(post.publishedAt)}
        </p>
        <Link to={`/posts/${post.slug}`}>
          <h3 className="mt-3 text-xl font-bold leading-8 text-espresso">{post.title}</h3>
        </Link>
        <p className="mt-3 text-sm leading-7 text-stone">{post.excerpt}</p>
        <Link
          to={`/posts/${post.slug}`}
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-espresso"
        >
          Đọc bài viết
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
};
