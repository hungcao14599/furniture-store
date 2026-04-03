type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    if (totalPages <= 7) {
      return true;
    }

    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
  });

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
      <button
        className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#ddd4c8] bg-white px-4 text-sm font-semibold text-espresso transition hover:border-[#111111] hover:bg-[#f8f4ee] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        Trước
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={
            page === currentPage
              ? "inline-flex h-11 min-w-11 items-center justify-center rounded-[10px] bg-[#111111] px-4 text-sm font-semibold text-white"
              : "inline-flex h-11 min-w-11 items-center justify-center rounded-[10px] border border-[#ddd4c8] bg-white px-4 text-sm font-semibold text-espresso transition hover:border-[#111111] hover:bg-[#f8f4ee]"
          }
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}
      <button
        className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#ddd4c8] bg-white px-4 text-sm font-semibold text-espresso transition hover:border-[#111111] hover:bg-[#f8f4ee] disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        Sau
      </button>
    </div>
  );
};
