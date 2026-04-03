# Lumina Maison

Website bán nội thất full-stack production-ready với frontend và backend tách riêng:

- `frontend`: React + TypeScript + Vite + Tailwind CSS + React Router + Axios + Zustand + TanStack Query
- `backend`: Node.js + Express + TypeScript + Prisma ORM + PostgreSQL + JWT + Multer + Supabase Storage

## 1. Kiến trúc tổng thể

### Frontend

- `React + Vite + TypeScript` cho SPA nhanh và dễ mở rộng
- `React Router` tách rõ public routes và admin routes
- `Zustand` cho `cart` và `admin auth`
- `Axios` với 2 client riêng:
  - `publicHttp` cho API public
  - `adminHttp` cho API admin có JWT interceptor
- `TanStack Query` cho data fetching, cache, invalidation và mutation state
- `Tailwind CSS` + custom design tokens cho giao diện sang trọng, responsive

### Backend

- `Express + TypeScript` cho REST API
- `Prisma + PostgreSQL` quản lý schema và query typed
- Chia lớp rõ ràng:
  - `routes`
  - `controllers`
  - `services`
  - `middlewares`
  - `utils`
- `JWT` cho xác thực admin
- `Multer` nhận multipart file, sau đó backend đẩy ảnh lên `Supabase Storage`
- `Zod` validation đầu vào
- Error response chuẩn JSON

### Data flow

1. Frontend gọi REST API qua Axios.
2. Backend validate request bằng Zod.
3. Service xử lý business logic và truy cập Prisma.
4. Response serialize Decimal/Date để frontend dùng trực tiếp.

## 2. Tính năng đã có

### User

- Trang chủ hiện đại với hero, danh mục nổi bật, sản phẩm mới, bán chạy, collection, brand story, testimonials, contact nhanh
- Danh sách sản phẩm:
  - grid đẹp
  - filter theo danh mục, giá, chất liệu, màu sắc
  - sort mới nhất, giá tăng, giá giảm, nổi bật
  - search
  - phân trang
- Chi tiết sản phẩm:
  - gallery nhiều ảnh
  - thông tin đầy đủ
  - thông số kỹ thuật
  - add to cart
  - related products
- Giỏ hàng:
  - thêm / cập nhật / xóa sản phẩm
  - tính tổng tiền
- Checkout:
  - tạo đơn hàng
  - trang thành công
- Bài viết / tin tức
- Trang liên hệ
- 404 page
- SEO cơ bản bằng title/meta động
- toast notification
- loading / empty / error states

### Admin

- Đăng nhập admin với JWT
- Dashboard tổng quan
- CRUD categories
- CRUD products
- Upload nhiều ảnh sản phẩm
- CRUD posts
- Cập nhật contact info
- Xem và cập nhật order status
- Xem / đánh dấu contact messages

## 3. Cây thư mục dự án

```text
.
├── backend
│   ├── prisma
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── config
│   │   ├── constants
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── routes
│   │   ├── services
│   │   ├── types
│   │   ├── utils
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── hooks
│   │   ├── layouts
│   │   ├── pages
│   │   │   ├── admin
│   │   │   └── public
│   │   ├── routes
│   │   ├── services
│   │   ├── store
│   │   ├── types
│   │   ├── utils
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── .env.example
├── package.json
├── .gitignore
└── README.md
```

## 4. Database schema

Schema Prisma nằm tại:

- [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma)

Các model chính:

- `AdminUser`
- `Category`
- `Product`
- `ProductImage`
- `Order`
- `OrderItem`
- `Post`
- `ContactInfo`
- `ContactMessage`

Quan hệ:

- `Category 1 - N Product`
- `Product 1 - N ProductImage`
- `Order 1 - N OrderItem`
- `Product 1 - N OrderItem` (snapshot vẫn được lưu trong order item)

## 5. Seed data mẫu

Seed nằm tại:

- [`backend/prisma/seed.ts`](./backend/prisma/seed.ts)

Bao gồm dữ liệu demo:

- 7 danh mục:
  - Sofa
  - Bàn ăn
  - Ghế
  - Giường ngủ
  - Tủ quần áo
  - Kệ sách
  - Đèn trang trí
- nhiều sản phẩm mẫu với ảnh, mô tả, specs, tồn kho
- 4 bài viết
- 2 đơn hàng mẫu
- 2 contact messages mẫu
- 1 tài khoản admin seed

## 6. API backend

### Public

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products/filter-options`
- `GET /api/products/:slug`
- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/contact-info`
- `POST /api/contact-messages`
- `POST /api/orders`

### Admin

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `GET /api/admin/dashboard/summary`
- `CRUD /api/admin/categories`
- `CRUD /api/admin/products`
- `CRUD /api/admin/posts`
- `GET/PUT /api/admin/contact-info`
- `GET/PATCH /api/admin/contact-messages`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status`
- `POST /api/admin/uploads`

## 7. Hướng dẫn chạy local

### Yêu cầu môi trường

- Node.js 20+
- PostgreSQL 14+
- npm 10+

### Bước 1: cài package

Từ thư mục gốc:

```bash
npm install
```

Hoặc cài riêng:

```bash
cd backend && npm install
cd frontend && npm install
```

### Bước 2: cấu hình `.env`

Backend:

```bash
cp backend/.env.example backend/.env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

#### Mẫu `backend/.env`

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/furniture_store?schema=public"
JWT_SECRET="change-this-secret"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
ADMIN_SEED_EMAIL="admin@luminamaison.com"
ADMIN_SEED_PASSWORD="Admin@123456"
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_STORAGE_BUCKET="product-images"
SUPABASE_STORAGE_FOLDER="lumina-maison"
```

#### Mẫu `frontend/.env`

```env
VITE_API_URL="http://localhost:5000/api"
VITE_BACKEND_URL="http://localhost:5000"
```

Lưu ý `Supabase Storage`:

- tạo bucket public, ví dụ `product-images`
- dùng `service_role key` ở backend để upload server-side
- API hiện vẫn giữ nguyên `POST /api/admin/uploads`, frontend không cần đổi contract

### Bước 3: migrate database

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### Bước 4: seed database

```bash
cd backend
npx prisma db seed
```

Admin seed mặc định:

- Email: `admin@luminamaison.com`
- Password: `Admin@123456`

Nếu đổi trong `.env`, seed sẽ dùng giá trị mới.

### Bước 5: chạy backend

```bash
cd backend
npm run dev
```

Backend mặc định:

- `http://localhost:5000`
- health check: `http://localhost:5000/health`

### Bước 6: chạy frontend

```bash
cd frontend
npm run dev
```

Frontend mặc định:

- `http://localhost:5173`

### Chạy từ root với workspace scripts

Terminal 1:

```bash
npm run dev:backend
```

Terminal 2:

```bash
npm run dev:frontend
```

### Build production

Build từng phần:

```bash
cd backend && npm run build
cd frontend && npm run build
```

Hoặc build từ root:

```bash
npm run build
```

## 8. Script quan trọng

### Root

- `npm run dev:backend`
- `npm run dev:frontend`
- `npm run build`

### Backend

- `npm run dev`
- `npm run build`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`

### Frontend

- `npm run dev`
- `npm run build`
- `npm run preview`

## 9. File quan trọng

### Backend

- [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma)
- [`backend/prisma/seed.ts`](./backend/prisma/seed.ts)
- [`backend/src/app.ts`](./backend/src/app.ts)
- [`backend/src/routes/admin.routes.ts`](./backend/src/routes/admin.routes.ts)
- [`backend/src/routes/public.routes.ts`](./backend/src/routes/public.routes.ts)
- [`backend/src/services/product.service.ts`](./backend/src/services/product.service.ts)
- [`backend/src/services/order.service.ts`](./backend/src/services/order.service.ts)

### Frontend

- [`frontend/src/routes/AppRouter.tsx`](./frontend/src/routes/AppRouter.tsx)
- [`frontend/src/layouts/MainLayout.tsx`](./frontend/src/layouts/MainLayout.tsx)
- [`frontend/src/layouts/AdminLayout.tsx`](./frontend/src/layouts/AdminLayout.tsx)
- [`frontend/src/pages/public/HomePage.tsx`](./frontend/src/pages/public/HomePage.tsx)
- [`frontend/src/pages/public/ProductsPage.tsx`](./frontend/src/pages/public/ProductsPage.tsx)
- [`frontend/src/pages/admin/ProductFormPage.tsx`](./frontend/src/pages/admin/ProductFormPage.tsx)
- [`frontend/src/pages/admin/OrderDetailPage.tsx`](./frontend/src/pages/admin/OrderDetailPage.tsx)

## 10. Lưu ý triển khai production

- Thay `JWT_SECRET` mạnh trước khi deploy
- Cấu hình CORS `FRONTEND_URL` đúng domain thật
- Ảnh upload hiện được lưu trên `Supabase Storage`
- Có thể đặt Nginx reverse proxy cho frontend/backend
- Bucket ảnh nên để `public` hoặc cần tự xây thêm luồng signed URL nếu muốn private

## 11. Ghi chú

Mã nguồn đã được tách rõ giữa frontend và backend, đồng bộ model dữ liệu, seed demo và UI/admin flow. Sau khi cài dependency và migrate PostgreSQL, dự án có thể chạy local theo hướng dẫn trên.
