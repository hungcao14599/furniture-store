import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from "./constants";

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value?: string | null) => {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const resolveImageUrl = (url?: string | null) => {
  if (!url) {
    return "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80";
  }

  if (url.startsWith("http")) {
    return url;
  }

  const defaultBackendUrl = import.meta.env.PROD ? "" : "http://localhost:5000";
  const backendUrl = (import.meta.env.VITE_BACKEND_URL?.trim() || defaultBackendUrl).replace(
    /\/$/,
    "",
  );

  return backendUrl ? `${backendUrl}${url}` : url;
};

export const resolveZaloUrl = (zalo?: string | null, phone?: string | null) => {
  const rawValue = zalo?.trim() || phone?.trim();

  if (!rawValue) {
    return undefined;
  }

  if (rawValue.startsWith("http")) {
    return rawValue;
  }

  const normalized = rawValue.replace(/[^\d]/g, "");
  return normalized ? `https://zalo.me/${normalized}` : undefined;
};

export const buildQrCodeUrl = (value?: string) => {
  if (!value) {
    return "";
  }

  const encodedValue = encodeURIComponent(value);
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodedValue}`;
};

export const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const parseSpecificationsText = (value: string) => {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((accumulator, line) => {
      const [key, ...rest] = line.split(":");

      if (!key || rest.length === 0) {
        return accumulator;
      }

      accumulator[key.trim()] = rest.join(":").trim();
      return accumulator;
    }, {});
};

export const stringifySpecifications = (value: Record<string, string>) =>
  Object.entries(value)
    .map(([key, item]) => `${key}: ${item}`)
    .join("\n");

export const estimateShipping = (subtotal: number) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;

export const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export const isValidPhone = (value: string) => /^[0-9+\s()-]{8,}$/.test(value);
