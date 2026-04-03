type LoadingSpinnerProps = {
  label?: string;
};

export const LoadingSpinner = ({ label = "Đang tải dữ liệu..." }: LoadingSpinnerProps) => {
  return (
    <div className="surface-card flex min-h-[240px] flex-col items-center justify-center gap-4 px-6 py-12 text-stone">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#e7ddd0] bg-[#f7f3ec]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#d7ccbe] border-t-espresso" />
      </div>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
};
