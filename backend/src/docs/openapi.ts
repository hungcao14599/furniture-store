import { ORDER_STATUS_VALUES } from "../constants/order.js";

const ref = (schemaName: string) => ({ $ref: `#/components/schemas/${schemaName}` });

const successEnvelopeSchema = (dataSchema: Record<string, unknown>, messageExample?: string) => ({
  type: "object",
  properties: {
    success: {
      type: "boolean",
      example: true,
      description: "Cờ xác nhận request được xử lý thành công.",
    },
    ...(messageExample
      ? {
          message: {
            type: "string",
            example: messageExample,
            description: "Thông báo ngắn gọn cho thao tác vừa thực hiện.",
          },
        }
      : {}),
    data: dataSchema,
  },
  required: messageExample ? ["success", "message", "data"] : ["success", "data"],
});

const successResponse = (
  description: string,
  dataSchema: Record<string, unknown>,
  messageExample?: string,
) => ({
  description,
  content: {
    "application/json": {
      schema: successEnvelopeSchema(dataSchema, messageExample),
    },
  },
});

const errorResponse = (description: string, statusCode: number, message: string, details?: unknown) => ({
  description,
  content: {
    "application/json": {
      schema: ref("ErrorResponse"),
      example: {
        success: false,
        statusCode,
        message,
        ...(details !== undefined ? { details } : {}),
      },
    },
  },
});

const paginationSchema = {
  type: "object",
  description: "Thông tin phân trang dùng chung cho các API danh sách.",
  properties: {
    page: { type: "integer", example: 1 },
    limit: { type: "integer", example: 12 },
    total: { type: "integer", example: 48 },
    totalPages: { type: "integer", example: 4 },
  },
  required: ["page", "limit", "total", "totalPages"],
};

const categoryExampleId = "cma-category-living";
const productExampleId = "cma-product-verona";
const postExampleId = "cma-post-modern-living";
const orderExampleId = "cma-order-240403";
const contactMessageExampleId = "cma-message-240403";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Lumina Maison Backend API",
    version: "1.0.0",
    description:
      "Tài liệu REST API cho website nội thất Lumina Maison. Bao gồm nhóm public API cho người dùng cuối và nhóm admin API dùng JWT Bearer token để quản trị nội dung, đơn hàng, bài viết và upload ảnh.",
    contact: {
      name: "Lumina Maison Engineering",
      email: "admin@luminamaison.com",
    },
  },
  tags: [
    { name: "Health", description: "Kiểm tra trạng thái hoạt động của backend." },
    { name: "Public Categories", description: "Danh mục sản phẩm hiển thị cho người dùng cuối." },
    { name: "Public Products", description: "Danh sách sản phẩm, bộ lọc và trang chi tiết sản phẩm." },
    { name: "Public Posts", description: "Tin tức, bài viết, cảm hứng thiết kế nội thất." },
    { name: "Public Contact", description: "Thông tin liên hệ và form liên hệ từ phía người dùng." },
    { name: "Public Orders", description: "API đặt hàng từ website public." },
    { name: "Admin Auth", description: "Xác thực quản trị viên bằng JWT." },
    { name: "Admin Dashboard", description: "Số liệu tổng quan cho trang dashboard quản trị." },
    { name: "Admin Categories", description: "CRUD danh mục sản phẩm." },
    { name: "Admin Products", description: "CRUD sản phẩm nội thất và dữ liệu hiển thị cho admin." },
    { name: "Admin Posts", description: "CRUD bài viết và tin tức." },
    { name: "Admin Contact", description: "Quản lý thông tin liên hệ và tin nhắn liên hệ." },
    { name: "Admin Orders", description: "Xem đơn hàng và cập nhật trạng thái xử lý." },
    { name: "Admin Uploads", description: "Upload ảnh lên Supabase Storage." },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token nhận được sau khi đăng nhập admin.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        description: "Mẫu lỗi JSON chuẩn được backend trả về.",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          message: {
            type: "string",
            example: "Dữ liệu gửi lên không hợp lệ",
          },
          details: {
            type: "object",
            nullable: true,
            description: "Chi tiết lỗi validation hoặc lỗi nghiệp vụ khi có.",
            additionalProperties: true,
          },
        },
        required: ["success", "message"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@luminamaison.com",
          },
          password: {
            type: "string",
            format: "password",
            example: "Admin@123456",
          },
        },
        required: ["email", "password"],
      },
      AdminUser: {
        type: "object",
        properties: {
          id: { type: "string", example: "cma-admin-001" },
          email: { type: "string", format: "email", example: "admin@luminamaison.com" },
          fullName: { type: "string", example: "Lumina Maison Admin" },
        },
        required: ["id", "email", "fullName"],
      },
      AdminAuthPayload: {
        type: "object",
        properties: {
          token: {
            type: "string",
            example:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-token.lumina-maison",
            description: "JWT token dùng cho tất cả admin API protected.",
          },
          admin: ref("AdminUser"),
        },
        required: ["token", "admin"],
      },
      CategoryCount: {
        type: "object",
        properties: {
          products: {
            type: "integer",
            example: 14,
            description: "Số lượng sản phẩm thuộc danh mục.",
          },
        },
        required: ["products"],
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", example: categoryExampleId },
          name: { type: "string", example: "Bàn ăn" },
          slug: { type: "string", example: "ban-an" },
          description: {
            type: "string",
            nullable: true,
            example: "Các mẫu bàn ăn hiện đại cho căn hộ, nhà phố và biệt thự.",
          },
          image: {
            type: "string",
            nullable: true,
            example: "https://example.supabase.co/storage/v1/object/public/product-images/categories/ban-an.jpg",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
        },
        required: ["id", "name", "slug", "createdAt", "updatedAt"],
      },
      CategoryWithCount: {
        allOf: [
          ref("Category"),
          {
            type: "object",
            properties: {
              _count: ref("CategoryCount"),
            },
            required: ["_count"],
          },
        ],
      },
      CategoryInput: {
        type: "object",
        properties: {
          name: {
            type: "string",
            minLength: 2,
            example: "Bàn ăn",
            description: "Tên danh mục hiển thị trên website.",
          },
          slug: {
            type: "string",
            nullable: true,
            example: "ban-an",
            description: "Slug tùy chọn. Nếu bỏ trống backend sẽ tự sinh từ tên.",
          },
          description: {
            type: "string",
            nullable: true,
            example: "Bộ sưu tập bàn ăn phong cách hiện đại, vật liệu gỗ và đá.",
          },
          image: {
            type: "string",
            nullable: true,
            example: "https://example.supabase.co/storage/v1/object/public/product-images/categories/ban-an.jpg",
          },
        },
        required: ["name"],
      },
      ProductImage: {
        type: "object",
        properties: {
          id: { type: "string", example: "cma-image-001" },
          url: {
            type: "string",
            example: "https://example.supabase.co/storage/v1/object/public/product-images/lumina-maison/2026/04/verona-main.jpg",
          },
          altText: {
            type: "string",
            nullable: true,
            example: "Bàn ăn Verona Stone 6 ghế - ảnh chính",
          },
          sortOrder: { type: "integer", example: 0 },
        },
        required: ["url", "sortOrder"],
      },
      ProductSpecifications: {
        type: "object",
        description: "Danh sách thông số kỹ thuật dạng key-value.",
        additionalProperties: {
          type: "string",
          example: "Gỗ sồi tự nhiên",
        },
        example: {
          "Khung bàn": "Gỗ sồi tự nhiên",
          "Mặt bàn": "Đá sintered tone be",
          "Bảo hành": "36 tháng",
        },
      },
      ProductSummary: {
        type: "object",
        properties: {
          id: { type: "string", example: productExampleId },
          name: { type: "string", example: "Bàn ăn Verona Stone 6 ghế" },
          slug: { type: "string", example: "ban-an-verona-stone-6-ghe" },
          sku: { type: "string", example: "DT-VERONA-006" },
          shortDescription: {
            type: "string",
            example: "Bàn ăn mặt đá sintered tone be, chân thép sơn tĩnh điện và tỷ lệ thanh lịch cho phòng ăn hiện đại.",
          },
          description: {
            type: "string",
            example: "Thiết kế bàn ăn hiện đại dành cho căn hộ và nhà phố, tối ưu thẩm mỹ và độ bền sử dụng hằng ngày.",
          },
          price: { type: "number", format: "float", example: 28900000 },
          material: { type: "string", example: "Đá sintered, thép sơn tĩnh điện" },
          color: { type: "string", example: "Be sáng" },
          dimensions: { type: "string", example: "W180 x D90 x H75 cm" },
          specifications: ref("ProductSpecifications"),
          stock: { type: "integer", example: 5 },
          featured: { type: "boolean", example: true },
          bestSeller: { type: "boolean", example: true },
          isNew: { type: "boolean", example: false },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
          categoryId: { type: "string", example: categoryExampleId },
          category: ref("Category"),
          images: {
            type: "array",
            items: ref("ProductImage"),
          },
        },
        required: [
          "id",
          "name",
          "slug",
          "sku",
          "shortDescription",
          "description",
          "price",
          "material",
          "color",
          "dimensions",
          "specifications",
          "stock",
          "featured",
          "bestSeller",
          "isNew",
          "createdAt",
          "updatedAt",
          "categoryId",
          "category",
          "images",
        ],
      },
      ProductDetail: {
        allOf: [
          ref("ProductSummary"),
          {
            type: "object",
            properties: {
              relatedProducts: {
                type: "array",
                items: ref("ProductSummary"),
                description: "Danh sách sản phẩm cùng danh mục để gợi ý mua thêm.",
              },
            },
            required: ["relatedProducts"],
          },
        ],
      },
      ProductImageInput: {
        type: "object",
        properties: {
          url: {
            type: "string",
            example: "https://example.supabase.co/storage/v1/object/public/product-images/lumina-maison/2026/04/verona-main.jpg",
          },
          altText: {
            type: "string",
            nullable: true,
            example: "Ảnh góc chính của bàn ăn Verona",
          },
          sortOrder: {
            type: "integer",
            nullable: true,
            example: 0,
          },
        },
        required: ["url"],
      },
      ProductInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Bàn ăn Verona Stone 6 ghế" },
          slug: {
            type: "string",
            nullable: true,
            example: "ban-an-verona-stone-6-ghe",
            description: "Nếu bỏ trống backend sẽ tự tạo slug từ tên sản phẩm.",
          },
          sku: { type: "string", example: "DT-VERONA-006" },
          shortDescription: {
            type: "string",
            example: "Bàn ăn mặt đá sintered tone be, chân thép sơn tĩnh điện và tỷ lệ thanh lịch cho phòng ăn hiện đại.",
          },
          description: {
            type: "string",
            example: "Thiết kế bàn ăn hiện đại dành cho căn hộ và nhà phố, mặt đá bền, dễ lau chùi, kết hợp ghế bọc nệm trung tính.",
          },
          price: { type: "number", format: "float", example: 28900000 },
          material: { type: "string", example: "Đá sintered, thép sơn tĩnh điện" },
          color: { type: "string", example: "Be sáng" },
          dimensions: { type: "string", example: "W180 x D90 x H75 cm" },
          specifications: ref("ProductSpecifications"),
          stock: { type: "integer", example: 5 },
          featured: { type: "boolean", example: true },
          bestSeller: { type: "boolean", example: true },
          isNew: { type: "boolean", example: false },
          categoryId: { type: "string", example: categoryExampleId },
          images: {
            type: "array",
            items: ref("ProductImageInput"),
            minItems: 1,
          },
        },
        required: [
          "name",
          "sku",
          "shortDescription",
          "description",
          "price",
          "material",
          "color",
          "dimensions",
          "specifications",
          "stock",
          "featured",
          "bestSeller",
          "isNew",
          "categoryId",
          "images",
        ],
      },
      ProductFilterOptions: {
        type: "object",
        properties: {
          materials: {
            type: "array",
            items: { type: "string" },
            example: ["Gỗ sồi", "Đá sintered", "Vải boucle"],
          },
          colors: {
            type: "array",
            items: { type: "string" },
            example: ["Be sáng", "Nâu gỗ", "Xám nhạt"],
          },
          priceRange: {
            type: "object",
            properties: {
              min: { type: "number", example: 2450000 },
              max: { type: "number", example: 28900000 },
            },
            required: ["min", "max"],
          },
        },
        required: ["materials", "colors", "priceRange"],
      },
      PaginatedProducts: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: ref("ProductSummary"),
          },
          pagination: paginationSchema,
        },
        required: ["items", "pagination"],
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "string", example: postExampleId },
          title: { type: "string", example: "5 nguyên tắc tạo phòng khách hiện đại và dễ sống" },
          slug: { type: "string", example: "5-nguyen-tac-tao-phong-khach-hien-dai-va-de-song" },
          excerpt: {
            type: "string",
            example: "Gợi ý bố cục, vật liệu và màu sắc để phòng khách hiện đại hơn nhưng vẫn ấm cúng.",
          },
          content: {
            type: "string",
            example: "## Mở đầu\nNội thất hiện đại không đồng nghĩa với lạnh lẽo. Điều quan trọng là giữ cân bằng giữa chất liệu, ánh sáng và tỷ lệ.",
          },
          coverImage: {
            type: "string",
            example: "https://example.supabase.co/storage/v1/object/public/product-images/posts/phong-khach-hien-dai.jpg",
          },
          authorName: { type: "string", example: "Lumina Editorial Team" },
          isPublished: { type: "boolean", example: true },
          publishedAt: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: "2026-04-03T07:00:00.000Z",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
        },
        required: [
          "id",
          "title",
          "slug",
          "excerpt",
          "content",
          "coverImage",
          "authorName",
          "isPublished",
          "createdAt",
          "updatedAt",
        ],
      },
      PostInput: {
        type: "object",
        properties: {
          title: { type: "string", example: "5 nguyên tắc tạo phòng khách hiện đại và dễ sống" },
          slug: {
            type: "string",
            nullable: true,
            example: "5-nguyen-tac-tao-phong-khach-hien-dai-va-de-song",
          },
          excerpt: {
            type: "string",
            example: "Gợi ý bố cục, vật liệu và màu sắc để phòng khách hiện đại hơn nhưng vẫn ấm cúng.",
          },
          content: {
            type: "string",
            example: "## Mở đầu\nNội thất hiện đại không đồng nghĩa với lạnh lẽo...",
          },
          coverImage: {
            type: "string",
            example: "https://example.supabase.co/storage/v1/object/public/product-images/posts/phong-khach-hien-dai.jpg",
          },
          authorName: { type: "string", example: "Lumina Editorial Team" },
          isPublished: { type: "boolean", example: true },
        },
        required: ["title", "excerpt", "content", "coverImage", "authorName", "isPublished"],
      },
      ContactInfo: {
        type: "object",
        properties: {
          id: { type: "string", example: "cma-contact-info-001" },
          phone: { type: "string", example: "0901 234 567" },
          email: { type: "string", format: "email", example: "hello@luminamaison.com" },
          address: {
            type: "string",
            example: "86 Nguyen Huu Canh, Binh Thanh, Ho Chi Minh City",
          },
          facebook: {
            type: "string",
            nullable: true,
            example: "https://facebook.com/luminamaison",
          },
          zalo: {
            type: "string",
            nullable: true,
            example: "https://zalo.me/0901234567",
          },
          instagram: {
            type: "string",
            nullable: true,
            example: "https://instagram.com/luminamaison",
          },
          mapEmbedUrl: {
            type: "string",
            nullable: true,
            example: "https://www.google.com/maps/embed?pb=!1m18...",
          },
          workingHours: {
            type: "string",
            example: "08:30 - 20:00, Thứ 2 - Chủ nhật",
          },
          introText: {
            type: "string",
            nullable: true,
            example: "Không gian trưng bày nội thất cao cấp với dịch vụ tư vấn thiết kế theo nhu cầu.",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
        },
        required: ["id", "phone", "email", "address", "workingHours", "createdAt", "updatedAt"],
      },
      ContactInfoInput: {
        type: "object",
        properties: {
          phone: { type: "string", example: "0901 234 567" },
          email: { type: "string", format: "email", example: "hello@luminamaison.com" },
          address: {
            type: "string",
            example: "86 Nguyen Huu Canh, Binh Thanh, Ho Chi Minh City",
          },
          facebook: {
            type: "string",
            nullable: true,
            example: "https://facebook.com/luminamaison",
          },
          zalo: {
            type: "string",
            nullable: true,
            example: "https://zalo.me/0901234567",
          },
          instagram: {
            type: "string",
            nullable: true,
            example: "https://instagram.com/luminamaison",
          },
          mapEmbedUrl: {
            type: "string",
            nullable: true,
            example: "https://www.google.com/maps/embed?pb=!1m18...",
          },
          workingHours: {
            type: "string",
            example: "08:30 - 20:00, Thứ 2 - Chủ nhật",
          },
          introText: {
            type: "string",
            nullable: true,
            example: "Showroom nội thất hiện đại với dịch vụ tư vấn nhanh và hỗ trợ đặt hàng.",
          },
        },
        required: ["phone", "email", "address", "workingHours"],
      },
      ContactMessage: {
        type: "object",
        properties: {
          id: { type: "string", example: contactMessageExampleId },
          name: { type: "string", example: "Nguyen Van A" },
          phone: { type: "string", example: "0901234567" },
          email: { type: "string", format: "email", example: "nguyenvana@gmail.com" },
          subject: { type: "string", example: "Tư vấn bộ bàn ăn 6 ghế" },
          message: {
            type: "string",
            example: "Tôi cần tư vấn bộ bàn ăn tone sáng cho căn hộ 2 phòng ngủ, vui lòng gọi lại giúp tôi.",
          },
          isHandled: { type: "boolean", example: false },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
        },
        required: ["id", "name", "phone", "email", "subject", "message", "isHandled", "createdAt", "updatedAt"],
      },
      ContactMessageInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Nguyen Van A" },
          phone: { type: "string", example: "0901234567" },
          email: { type: "string", format: "email", example: "nguyenvana@gmail.com" },
          subject: { type: "string", example: "Tư vấn bộ bàn ăn 6 ghế" },
          message: {
            type: "string",
            example: "Tôi cần tư vấn bộ bàn ăn tone sáng cho căn hộ 2 phòng ngủ, vui lòng gọi lại giúp tôi.",
          },
        },
        required: ["name", "phone", "email", "subject", "message"],
      },
      ContactMessageHandleInput: {
        type: "object",
        properties: {
          isHandled: {
            type: "boolean",
            example: true,
            description: "Đánh dấu tin nhắn đã được xử lý hoặc chưa xử lý.",
          },
        },
        required: ["isHandled"],
      },
      OrderItemInput: {
        type: "object",
        properties: {
          productId: { type: "string", example: productExampleId },
          quantity: { type: "integer", example: 2, minimum: 1, maximum: 10 },
        },
        required: ["productId", "quantity"],
      },
      OrderInput: {
        type: "object",
        properties: {
          customerName: { type: "string", example: "Nguyen Van A" },
          phone: { type: "string", example: "0901234567" },
          email: { type: "string", format: "email", example: "nguyenvana@gmail.com" },
          address: { type: "string", example: "12 Nguyen Hue, District 1, Ho Chi Minh City" },
          note: {
            type: "string",
            nullable: true,
            example: "Giao hàng giờ hành chính, liên hệ trước 30 phút.",
          },
          items: {
            type: "array",
            items: ref("OrderItemInput"),
            minItems: 1,
          },
        },
        required: ["customerName", "phone", "email", "address", "items"],
      },
      OrderItem: {
        type: "object",
        properties: {
          id: { type: "string", example: "cma-order-item-001" },
          quantity: { type: "integer", example: 2 },
          unitPrice: { type: "number", example: 28900000 },
          productNameSnapshot: { type: "string", example: "Bàn ăn Verona Stone 6 ghế" },
          productSlugSnapshot: { type: "string", example: "ban-an-verona-stone-6-ghe" },
          imageSnapshot: {
            type: "string",
            nullable: true,
            example: "https://example.supabase.co/storage/v1/object/public/product-images/lumina-maison/2026/04/verona-main.jpg",
          },
          productId: { type: "string", example: productExampleId },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
        },
        required: [
          "id",
          "quantity",
          "unitPrice",
          "productNameSnapshot",
          "productSlugSnapshot",
          "productId",
          "createdAt",
        ],
      },
      OrderListItem: {
        type: "object",
        properties: {
          id: { type: "string", example: orderExampleId },
          code: { type: "string", example: "LM240403123" },
          customerName: { type: "string", example: "Nguyen Van A" },
          phone: { type: "string", example: "0901234567" },
          email: { type: "string", format: "email", example: "nguyenvana@gmail.com" },
          address: { type: "string", example: "12 Nguyen Hue, District 1, Ho Chi Minh City" },
          note: {
            type: "string",
            nullable: true,
            example: "Giao hàng giờ hành chính.",
          },
          status: {
            type: "string",
            enum: ORDER_STATUS_VALUES,
            example: "NEW",
          },
          subtotal: { type: "number", example: 28900000 },
          shippingFee: { type: "number", example: 0 },
          total: { type: "number", example: 28900000 },
          createdAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2026-04-03T07:00:00.000Z",
          },
          items: {
            type: "array",
            items: ref("OrderItem"),
          },
        },
        required: [
          "id",
          "code",
          "customerName",
          "phone",
          "email",
          "address",
          "status",
          "subtotal",
          "shippingFee",
          "total",
          "createdAt",
          "updatedAt",
          "items",
        ],
      },
      OrderDetailItem: {
        allOf: [
          ref("OrderItem"),
          {
            type: "object",
            properties: {
              product: {
                allOf: [
                  ref("ProductSummary"),
                  {
                    type: "object",
                    properties: {
                      category: ref("Category"),
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      OrderDetail: {
        allOf: [
          ref("OrderListItem"),
          {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: ref("OrderDetailItem"),
              },
            },
          },
        ],
      },
      OrderStatusUpdateInput: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ORDER_STATUS_VALUES,
            example: "CONFIRMED",
            description: "Trạng thái mới của đơn hàng.",
          },
        },
        required: ["status"],
      },
      PaginatedOrders: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: ref("OrderListItem"),
          },
          pagination: paginationSchema,
        },
        required: ["items", "pagination"],
      },
      DashboardMetrics: {
        type: "object",
        properties: {
          productCount: { type: "integer", example: 42 },
          orderCount: { type: "integer", example: 18 },
          postCount: { type: "integer", example: 8 },
          contactMessageCount: { type: "integer", example: 11 },
        },
        required: ["productCount", "orderCount", "postCount", "contactMessageCount"],
      },
      DashboardSummary: {
        type: "object",
        properties: {
          metrics: ref("DashboardMetrics"),
          latestOrders: {
            type: "array",
            items: ref("OrderListItem"),
          },
        },
        required: ["metrics", "latestOrders"],
      },
      UploadedFile: {
        type: "object",
        properties: {
          name: { type: "string", example: "1712130931-ab12cd34-verona-main.jpg" },
          url: {
            type: "string",
            example: "https://example.supabase.co/storage/v1/object/public/product-images/lumina-maison/2026/04/1712130931-ab12cd34-verona-main.jpg",
          },
          size: { type: "integer", example: 248320 },
          mimetype: { type: "string", example: "image/jpeg" },
        },
        required: ["name", "url", "size", "mimetype"],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Kiểm tra trạng thái backend",
        description: "Endpoint kiểm tra nhanh để monitoring hoặc load balancer biết backend còn hoạt động bình thường.",
        responses: {
          200: successResponse("Backend hoạt động bình thường.", {
            type: "object",
            properties: {
              message: {
                type: "string",
                example: "Backend is healthy",
              },
            },
            required: ["message"],
          }),
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Public Categories"],
        summary: "Lấy danh sách danh mục public",
        description: "Trả về danh mục sắp xếp theo tên cùng số lượng sản phẩm mỗi danh mục để render sidebar, mega menu và block danh mục nổi bật.",
        responses: {
          200: successResponse("Danh sách danh mục public.", {
            type: "array",
            items: ref("CategoryWithCount"),
          }),
        },
      },
    },
    "/api/products/filter-options": {
      get: {
        tags: ["Public Products"],
        summary: "Lấy dữ liệu bộ lọc sản phẩm",
        description: "Trả về danh sách chất liệu, màu sắc và khoảng giá nhỏ nhất/lớn nhất để frontend dựng UI filter.",
        responses: {
          200: successResponse("Dữ liệu filter sản phẩm.", ref("ProductFilterOptions")),
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Public Products"],
        summary: "Lấy danh sách sản phẩm public",
        description: "Hỗ trợ tìm kiếm, lọc, sắp xếp và phân trang cho trang danh sách sản phẩm phía người dùng.",
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", example: 1 }, description: "Trang hiện tại." },
          { in: "query", name: "limit", schema: { type: "integer", example: 12 }, description: "Số item trên mỗi trang." },
          { in: "query", name: "category", schema: { type: "string", example: "ban-an" }, description: "Slug danh mục." },
          { in: "query", name: "material", schema: { type: "string", example: "Đá sintered, thép sơn tĩnh điện" }, description: "Lọc theo chất liệu." },
          { in: "query", name: "color", schema: { type: "string", example: "Be sáng" }, description: "Lọc theo màu sắc." },
          { in: "query", name: "minPrice", schema: { type: "number", example: 5000000 }, description: "Giá nhỏ nhất." },
          { in: "query", name: "maxPrice", schema: { type: "number", example: 30000000 }, description: "Giá lớn nhất." },
          {
            in: "query",
            name: "sort",
            schema: { type: "string", enum: ["newest", "price_asc", "price_desc", "featured"], example: "featured" },
            description: "Kiểu sắp xếp. Nếu bỏ trống backend mặc định sort theo mới nhất.",
          },
          { in: "query", name: "search", schema: { type: "string", example: "verona" }, description: "Từ khóa tìm kiếm." },
          { in: "query", name: "featured", schema: { type: "boolean", example: true }, description: "Lọc sản phẩm nổi bật." },
          { in: "query", name: "bestSeller", schema: { type: "boolean", example: true }, description: "Lọc sản phẩm bán chạy." },
          { in: "query", name: "isNew", schema: { type: "boolean", example: true }, description: "Lọc sản phẩm mới." },
        ],
        responses: {
          200: successResponse("Danh sách sản phẩm public đã lọc.", ref("PaginatedProducts")),
        },
      },
    },
    "/api/products/{slug}": {
      get: {
        tags: ["Public Products"],
        summary: "Lấy chi tiết sản phẩm theo slug",
        description: "Dùng cho trang chi tiết sản phẩm, bao gồm toàn bộ gallery, thông tin kỹ thuật và sản phẩm liên quan.",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string", example: "ban-an-verona-stone-6-ghe" },
            description: "Slug duy nhất của sản phẩm.",
          },
        ],
        responses: {
          200: successResponse("Chi tiết sản phẩm.", ref("ProductDetail")),
          404: errorResponse("Sản phẩm không tồn tại.", 404, "Sản phẩm không tồn tại"),
        },
      },
    },
    "/api/posts": {
      get: {
        tags: ["Public Posts"],
        summary: "Lấy danh sách bài viết public",
        description: "Chỉ trả về các bài viết đã publish để hiển thị trên trang tin tức phía người dùng.",
        responses: {
          200: successResponse("Danh sách bài viết đã publish.", {
            type: "array",
            items: ref("Post"),
          }),
        },
      },
    },
    "/api/posts/{slug}": {
      get: {
        tags: ["Public Posts"],
        summary: "Lấy chi tiết bài viết theo slug",
        parameters: [
          {
            in: "path",
            name: "slug",
            required: true,
            schema: { type: "string", example: "5-nguyen-tac-tao-phong-khach-hien-dai-va-de-song" },
          },
        ],
        responses: {
          200: successResponse("Chi tiết bài viết.", ref("Post")),
          404: errorResponse("Bài viết không tồn tại hoặc chưa publish.", 404, "Bài viết không tồn tại"),
        },
      },
    },
    "/api/contact-info": {
      get: {
        tags: ["Public Contact"],
        summary: "Lấy thông tin liên hệ cửa hàng",
        description: "Dùng cho trang liên hệ, footer và floating contact action phía public.",
        responses: {
          200: successResponse("Thông tin liên hệ hiện tại.", ref("ContactInfo")),
        },
      },
    },
    "/api/contact-messages": {
      post: {
        tags: ["Public Contact"],
        summary: "Gửi yêu cầu liên hệ từ khách hàng",
        description: "Lưu thông tin khách để đội ngũ tư vấn liên hệ lại. Dùng cho form liên hệ nhanh hoặc trang contact.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("ContactMessageInput"),
            },
          },
        },
        responses: {
          201: successResponse("Tạo yêu cầu liên hệ thành công.", ref("ContactMessage"), "Yêu cầu liên hệ đã được gửi"),
          400: errorResponse("Dữ liệu không hợp lệ.", 400, "Dữ liệu gửi lên không hợp lệ"),
        },
      },
    },
    "/api/orders": {
      post: {
        tags: ["Public Orders"],
        summary: "Tạo đơn hàng từ giỏ hàng public",
        description: "Tạo đơn hàng mới, kiểm tra tồn kho và trừ tồn kho tương ứng cho từng sản phẩm hợp lệ.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("OrderInput"),
            },
          },
        },
        responses: {
          201: successResponse("Tạo đơn hàng thành công.", ref("OrderListItem"), "Đặt hàng thành công"),
          400: errorResponse(
            "Dữ liệu không hợp lệ hoặc sản phẩm không đủ tồn kho.",
            400,
            'Sản phẩm "Bàn ăn Verona Stone 6 ghế" không đủ tồn kho',
          ),
        },
      },
    },
    "/api/admin/auth/login": {
      post: {
        tags: ["Admin Auth"],
        summary: "Đăng nhập admin",
        description: "Xác thực bằng email và mật khẩu, trả về JWT token dùng cho toàn bộ admin API protected.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("LoginRequest"),
            },
          },
        },
        responses: {
          200: successResponse("Đăng nhập thành công.", ref("AdminAuthPayload"), "Đăng nhập thành công"),
          401: errorResponse("Sai tài khoản hoặc mật khẩu.", 401, "Email hoặc mật khẩu không đúng"),
        },
      },
    },
    "/api/admin/auth/me": {
      get: {
        tags: ["Admin Auth"],
        summary: "Lấy thông tin admin hiện tại",
        description: "Kiểm tra token hiện tại còn hợp lệ và trả về thông tin tài khoản quản trị viên.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: successResponse("Thông tin admin hiện tại.", ref("AdminUser")),
          401: errorResponse("Chưa đăng nhập hoặc token không hợp lệ.", 401, "Bạn chưa đăng nhập"),
        },
      },
    },
    "/api/admin/dashboard/summary": {
      get: {
        tags: ["Admin Dashboard"],
        summary: "Lấy dữ liệu dashboard",
        description: "Trả về các chỉ số tổng quan và 5 đơn hàng gần đây để hiển thị trên dashboard quản trị.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: successResponse("Dữ liệu dashboard.", ref("DashboardSummary")),
          401: errorResponse("Chưa đăng nhập.", 401, "Bạn chưa đăng nhập"),
        },
      },
    },
    "/api/admin/categories": {
      get: {
        tags: ["Admin Categories"],
        summary: "Lấy danh sách danh mục cho admin",
        description: "Trả về tất cả danh mục theo thứ tự mới cập nhật, kèm tổng số sản phẩm mỗi danh mục.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: successResponse("Danh sách danh mục admin.", {
            type: "array",
            items: ref("CategoryWithCount"),
          }),
        },
      },
      post: {
        tags: ["Admin Categories"],
        summary: "Tạo danh mục mới",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("CategoryInput"),
            },
          },
        },
        responses: {
          201: successResponse("Tạo danh mục thành công.", ref("Category"), "Tạo danh mục thành công"),
          400: errorResponse("Dữ liệu đầu vào không hợp lệ.", 400, "Dữ liệu gửi lên không hợp lệ"),
          409: errorResponse("Slug hoặc tên danh mục bị trùng.", 409, "Dữ liệu bị trùng với bản ghi đã tồn tại"),
        },
      },
    },
    "/api/admin/categories/{id}": {
      put: {
        tags: ["Admin Categories"],
        summary: "Cập nhật danh mục",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", example: categoryExampleId },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("CategoryInput"),
            },
          },
        },
        responses: {
          200: successResponse("Cập nhật danh mục thành công.", ref("Category"), "Cập nhật danh mục thành công"),
          404: errorResponse("Danh mục không tồn tại.", 404, "Bản ghi không tồn tại"),
        },
      },
      delete: {
        tags: ["Admin Categories"],
        summary: "Xóa danh mục",
        description: "Chỉ xóa được danh mục chưa chứa sản phẩm nào.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", example: categoryExampleId },
          },
        ],
        responses: {
          200: {
            description: "Xóa danh mục thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Xóa danh mục thành công" },
                  },
                  required: ["success", "message"],
                },
              },
            },
          },
          400: errorResponse("Danh mục đang chứa sản phẩm nên không thể xóa.", 400, "Không thể xóa danh mục đang chứa sản phẩm"),
          404: errorResponse("Danh mục không tồn tại.", 404, "Danh mục không tồn tại"),
        },
      },
    },
    "/api/admin/products": {
      get: {
        tags: ["Admin Products"],
        summary: "Lấy danh sách sản phẩm cho admin",
        description: "Hỗ trợ tìm kiếm theo tên, SKU hoặc tên danh mục để quản trị sản phẩm thuận tiện hơn.",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", example: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", example: 10 } },
          { in: "query", name: "search", schema: { type: "string", example: "verona" } },
        ],
        responses: {
          200: successResponse("Danh sách sản phẩm admin.", ref("PaginatedProducts")),
        },
      },
      post: {
        tags: ["Admin Products"],
        summary: "Tạo sản phẩm mới",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("ProductInput"),
            },
          },
        },
        responses: {
          201: successResponse("Tạo sản phẩm thành công.", ref("ProductSummary"), "Tạo sản phẩm thành công"),
          400: errorResponse("Danh mục không hợp lệ hoặc dữ liệu đầu vào sai.", 400, "Danh mục không tồn tại"),
          409: errorResponse("SKU hoặc slug bị trùng.", 409, "Dữ liệu bị trùng với bản ghi đã tồn tại"),
        },
      },
    },
    "/api/admin/products/{id}": {
      get: {
        tags: ["Admin Products"],
        summary: "Lấy chi tiết sản phẩm theo id cho admin",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", example: productExampleId },
          },
        ],
        responses: {
          200: successResponse("Chi tiết sản phẩm.", ref("ProductSummary")),
          404: errorResponse("Sản phẩm không tồn tại.", 404, "Sản phẩm không tồn tại"),
        },
      },
      put: {
        tags: ["Admin Products"],
        summary: "Cập nhật sản phẩm",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", example: productExampleId },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("ProductInput"),
            },
          },
        },
        responses: {
          200: successResponse("Cập nhật sản phẩm thành công.", ref("ProductSummary"), "Cập nhật sản phẩm thành công"),
          400: errorResponse("Danh mục đầu vào không tồn tại.", 400, "Danh mục không tồn tại"),
          404: errorResponse("Sản phẩm không tồn tại.", 404, "Sản phẩm không tồn tại"),
        },
      },
      delete: {
        tags: ["Admin Products"],
        summary: "Xóa sản phẩm",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", example: productExampleId },
          },
        ],
        responses: {
          200: {
            description: "Xóa sản phẩm thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Xóa sản phẩm thành công" },
                  },
                  required: ["success", "message"],
                },
              },
            },
          },
          404: errorResponse("Sản phẩm không tồn tại.", 404, "Bản ghi không tồn tại"),
        },
      },
    },
    "/api/admin/posts": {
      get: {
        tags: ["Admin Posts"],
        summary: "Lấy danh sách bài viết cho admin",
        security: [{ bearerAuth: [] }],
        responses: {
          200: successResponse("Danh sách bài viết admin.", {
            type: "array",
            items: ref("Post"),
          }),
        },
      },
      post: {
        tags: ["Admin Posts"],
        summary: "Tạo bài viết mới",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("PostInput"),
            },
          },
        },
        responses: {
          201: successResponse("Tạo bài viết thành công.", ref("Post"), "Tạo bài viết thành công"),
          400: errorResponse("Dữ liệu bài viết không hợp lệ.", 400, "Dữ liệu gửi lên không hợp lệ"),
          409: errorResponse("Slug bài viết bị trùng.", 409, "Dữ liệu bị trùng với bản ghi đã tồn tại"),
        },
      },
    },
    "/api/admin/posts/{id}": {
      get: {
        tags: ["Admin Posts"],
        summary: "Lấy chi tiết bài viết theo id",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", example: postExampleId } },
        ],
        responses: {
          200: successResponse("Chi tiết bài viết.", ref("Post")),
          404: errorResponse("Bài viết không tồn tại.", 404, "Bài viết không tồn tại"),
        },
      },
      put: {
        tags: ["Admin Posts"],
        summary: "Cập nhật bài viết",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", example: postExampleId } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("PostInput"),
            },
          },
        },
        responses: {
          200: successResponse("Cập nhật bài viết thành công.", ref("Post"), "Cập nhật bài viết thành công"),
          404: errorResponse("Bài viết không tồn tại.", 404, "Bài viết không tồn tại"),
        },
      },
      delete: {
        tags: ["Admin Posts"],
        summary: "Xóa bài viết",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", example: postExampleId } },
        ],
        responses: {
          200: {
            description: "Xóa bài viết thành công.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    message: { type: "string", example: "Xóa bài viết thành công" },
                  },
                  required: ["success", "message"],
                },
              },
            },
          },
          404: errorResponse("Bài viết không tồn tại.", 404, "Bản ghi không tồn tại"),
        },
      },
    },
    "/api/admin/contact-info": {
      get: {
        tags: ["Admin Contact"],
        summary: "Lấy thông tin liên hệ để quản trị",
        security: [{ bearerAuth: [] }],
        responses: {
          200: successResponse("Thông tin liên hệ hiện tại.", ref("ContactInfo")),
        },
      },
      put: {
        tags: ["Admin Contact"],
        summary: "Cập nhật thông tin liên hệ",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("ContactInfoInput"),
            },
          },
        },
        responses: {
          200: successResponse("Cập nhật thông tin liên hệ thành công.", ref("ContactInfo"), "Cập nhật thông tin liên hệ thành công"),
          400: errorResponse("Dữ liệu liên hệ không hợp lệ.", 400, "Dữ liệu gửi lên không hợp lệ"),
        },
      },
    },
    "/api/admin/contact-messages": {
      get: {
        tags: ["Admin Contact"],
        summary: "Lấy danh sách tin nhắn liên hệ",
        description: "Có thể lọc theo trạng thái đã xử lý hoặc chưa xử lý.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "isHandled",
            schema: { type: "boolean", example: false },
            description: "Lọc tin nhắn theo trạng thái xử lý.",
          },
        ],
        responses: {
          200: successResponse("Danh sách tin nhắn liên hệ.", {
            type: "array",
            items: ref("ContactMessage"),
          }),
        },
      },
    },
    "/api/admin/contact-messages/{id}/handle": {
      patch: {
        tags: ["Admin Contact"],
        summary: "Cập nhật trạng thái xử lý của tin nhắn liên hệ",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", example: contactMessageExampleId },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("ContactMessageHandleInput"),
            },
          },
        },
        responses: {
          200: successResponse("Cập nhật trạng thái liên hệ thành công.", ref("ContactMessage"), "Đã cập nhật trạng thái liên hệ"),
          404: errorResponse("Tin nhắn liên hệ không tồn tại.", 404, "Bản ghi không tồn tại"),
        },
      },
    },
    "/api/admin/orders": {
      get: {
        tags: ["Admin Orders"],
        summary: "Lấy danh sách đơn hàng",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "query", name: "page", schema: { type: "integer", example: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", example: 10 } },
          {
            in: "query",
            name: "status",
            schema: { type: "string", enum: ORDER_STATUS_VALUES, example: "NEW" },
            description: "Lọc danh sách theo trạng thái đơn hàng.",
          },
        ],
        responses: {
          200: successResponse("Danh sách đơn hàng.", ref("PaginatedOrders")),
        },
      },
    },
    "/api/admin/orders/{id}": {
      get: {
        tags: ["Admin Orders"],
        summary: "Lấy chi tiết đơn hàng",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", example: orderExampleId } },
        ],
        responses: {
          200: successResponse("Chi tiết đơn hàng.", ref("OrderDetail")),
          404: errorResponse("Đơn hàng không tồn tại.", 404, "Đơn hàng không tồn tại"),
        },
      },
    },
    "/api/admin/orders/{id}/status": {
      patch: {
        tags: ["Admin Orders"],
        summary: "Cập nhật trạng thái đơn hàng",
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: "path", name: "id", required: true, schema: { type: "string", example: orderExampleId } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("OrderStatusUpdateInput"),
            },
          },
        },
        responses: {
          200: successResponse("Cập nhật trạng thái đơn hàng thành công.", ref("OrderListItem"), "Cập nhật trạng thái đơn hàng thành công"),
          404: errorResponse("Đơn hàng không tồn tại.", 404, "Bản ghi không tồn tại"),
        },
      },
    },
    "/api/admin/uploads": {
      post: {
        tags: ["Admin Uploads"],
        summary: "Upload nhiều ảnh lên Supabase Storage",
        description: "Nhận tối đa 10 file trong field `images`, upload lên bucket Supabase Storage và trả về URL public để dùng cho sản phẩm hoặc bài viết.",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  images: {
                    type: "array",
                    items: {
                      type: "string",
                      format: "binary",
                    },
                    description: "Danh sách file ảnh cần upload. Tối đa 10 file.",
                  },
                },
                required: ["images"],
              },
            },
          },
        },
        responses: {
          201: successResponse("Upload ảnh thành công.", {
            type: "array",
            items: ref("UploadedFile"),
          }, "Upload ảnh thành công"),
          400: errorResponse("Không có file hoặc file không hợp lệ.", 400, "Không có file nào được tải lên"),
          500: errorResponse(
            "Thiếu cấu hình Supabase Storage hoặc upload thất bại.",
            500,
            "Thiếu cấu hình Supabase Storage. Hãy thiết lập SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY.",
          ),
        },
      },
    },
  },
} as const;
