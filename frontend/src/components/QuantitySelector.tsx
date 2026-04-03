type QuantitySelectorProps = {
  value: number;
  max: number;
  onChange: (value: number) => void;
  variant?: "pill" | "square";
};

export const QuantitySelector = ({
  value,
  max,
  onChange,
  variant = "pill",
}: QuantitySelectorProps) => {
  if (variant === "square") {
    return (
      <div className="inline-flex items-center overflow-hidden rounded-[4px] border border-[#e0d6c9] bg-white">
        <span className="flex h-12 min-w-[56px] items-center justify-center border-r border-[#ebe1d4] text-sm font-medium text-espresso">
          {value}
        </span>
        <div className="flex flex-col">
          <button
            className="flex h-6 w-8 items-center justify-center border-b border-l border-[#ebe1d4] text-xs text-stone transition hover:bg-[#f8f4ee] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={value >= max}
            onClick={() => onChange(Math.min(max, value + 1))}
          >
            +
          </button>
          <button
            className="flex h-6 w-8 items-center justify-center border-l border-[#ebe1d4] text-xs text-stone transition hover:bg-[#f8f4ee] disabled:cursor-not-allowed disabled:opacity-40"
            disabled={value <= 1}
            onClick={() => onChange(Math.max(1, value - 1))}
          >
            -
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center rounded-full border border-[#e3d8c8] bg-white px-2 py-1">
      <button
        className="h-9 w-9 rounded-full text-lg text-espresso transition hover:bg-sand disabled:opacity-40"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        -
      </button>
      <span className="w-10 text-center text-sm font-semibold text-espresso">{value}</span>
      <button
        className="h-9 w-9 rounded-full text-lg text-espresso transition hover:bg-sand disabled:opacity-40"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
};
