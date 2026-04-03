import { Search } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";

type ProductImageZoomProps = {
  src: string;
  alt: string;
  helperText?: string;
};

type ZoomState = {
  active: boolean;
  x: number;
  y: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const ProductImageZoom = ({
  src,
  alt,
  helperText = "Rê chuột vào ảnh để xem preview chi tiết",
}: ProductImageZoomProps) => {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [zoomState, setZoomState] = useState<ZoomState>({
    active: false,
    x: 50,
    y: 50,
  });

  useEffect(() => {
    setZoomState({
      active: false,
      x: 50,
      y: 50,
    });
  }, [src]);

  const updateZoom = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    const bounds = frameRef.current?.getBoundingClientRect();

    if (!bounds) {
      return;
    }

    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 0, 100);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 0, 100);

    setZoomState({
      active: true,
      x,
      y,
    });
  };

  const resetZoom = () => {
    setZoomState((current) => ({
      ...current,
      active: false,
    }));
  };

  return (
    <div>
      <div
        ref={frameRef}
        className="group relative overflow-hidden border border-[#ece3d7] bg-white"
        onPointerEnter={updateZoom}
        onPointerMove={updateZoom}
        onPointerLeave={resetZoom}
      >
        <img
          src={src}
          alt={alt}
          className="aspect-[1/1] w-full cursor-zoom-in object-cover transition-transform duration-100"
          style={{
            transformOrigin: `${zoomState.x}% ${zoomState.y}%`,
            transform: zoomState.active ? "scale(2.15)" : "scale(1)",
          }}
        />

        <div
          className={`pointer-events-none absolute inset-0 transition duration-150 ${
            zoomState.active ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/96 text-[#4f4b45] shadow-[0_12px_24px_rgba(17,17,17,0.18)]"
            style={{
              left: `calc(${zoomState.x}% + 18px)`,
              top: `calc(${zoomState.y}% - 18px)`,
            }}
          >
            <Search className="h-4 w-4" />
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#4f4b45] shadow-soft">
          <Search className="h-3.5 w-3.5" />
          {zoomState.active ? "Đang soi chi tiết" : helperText}
        </div>
      </div>

      <p className="mt-3 hidden text-xs text-[#8a8177] lg:block">
        Di chuyển chuột trên ảnh để phóng to ngay trong khung hiện tại.
      </p>
    </div>
  );
};
