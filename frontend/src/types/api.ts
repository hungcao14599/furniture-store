export type OrderStatus =
  | "NEW"
  | "PROCESSING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELED";

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: {
    products: number;
  };
};

export type ProductImage = {
  id?: string;
  url: string;
  altText?: string | null;
  sortOrder?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  description: string;
  price: number;
  material: string;
  color: string;
  dimensions: string;
  specifications: Record<string, string>;
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type ProductListPayload = {
  items: Product[];
  pagination: Pagination;
};

export type ProductDetail = Product & {
  relatedProducts: Product[];
};

export type ProductFilterOptions = {
  materials: string[];
  colors: string[];
  priceRange: {
    min: number;
    max: number;
  };
};

export type ProductQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  material?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "featured";
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactInfo = {
  id: string;
  phone: string;
  email: string;
  address: string;
  facebook?: string | null;
  zalo?: string | null;
  instagram?: string | null;
  mapEmbedUrl?: string | null;
  workingHours: string;
  introText?: string | null;
};

export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  isHandled: boolean;
  createdAt: string;
};

export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  productNameSnapshot: string;
  productSlugSnapshot: string;
  imageSnapshot?: string | null;
  productId?: string | null;
  product?: Product;
};

export type Order = {
  id: string;
  code: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note?: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrdersPayload = {
  items: Order[];
  pagination: Pagination;
};

export type DashboardSummary = {
  metrics: {
    productCount: number;
    orderCount: number;
    postCount: number;
    contactMessageCount: number;
  };
  latestOrders: Order[];
};

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
};

export type AuthPayload = {
  token: string;
  admin: AdminUser;
};

export type UploadedImage = {
  name: string;
  url: string;
  size: number;
  mimetype: string;
};
