import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
} from "../constants/order.js";
import { AppError } from "../utils/appError.js";
import { getPagination } from "../utils/pagination.js";

type CreateOrderPayload = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

const buildOrderCode = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(100 + Math.random() * 900);
  return `LM${timestamp}${random}`;
};

export const orderService = {
  async createOrder(payload: CreateOrderPayload) {
    const productIds = [...new Set(payload.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new AppError("Một hoặc nhiều sản phẩm không còn tồn tại", 400);
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const subtotal = payload.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);

      if (!product) {
        throw new AppError("Sản phẩm không hợp lệ", 400);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Sản phẩm "${product.name}" không đủ tồn kho`, 400);
      }

      return sum + Number(product.price) * item.quantity;
    }, 0);

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const order = await prisma.$transaction(async (transaction) => {
      for (const item of payload.items) {
        await transaction.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return transaction.order.create({
        data: {
          code: buildOrderCode(),
          customerName: payload.customerName,
          phone: payload.phone,
          email: payload.email,
          address: payload.address,
          note: payload.note,
          subtotal: new Prisma.Decimal(subtotal),
          shippingFee: new Prisma.Decimal(shippingFee),
          total: new Prisma.Decimal(total),
          items: {
            create: payload.items.map((item) => {
              const product = productMap.get(item.productId);

              if (!product) {
                throw new AppError("Sản phẩm không hợp lệ", 400);
              }

              return {
                quantity: item.quantity,
                unitPrice: new Prisma.Decimal(product.price),
                productNameSnapshot: product.name,
                productSlugSnapshot: product.slug,
                imageSnapshot: product.images[0]?.url,
                productId: product.id,
              };
            }),
          },
        },
        include: {
          items: true,
        },
      });
    });

    return order;
  },

  async getOrders(query: Record<string, string | undefined>) {
    const { page, limit, skip } = getPagination(query.page, query.limit, 10);
    const status = query.status as OrderStatus | undefined;

    const where = status ? { status } : undefined;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError("Đơn hàng không tồn tại", 404);
    }

    return order;
  },

  updateOrderStatus(id: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  },
};
