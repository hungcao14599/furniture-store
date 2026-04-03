import { prisma } from "../config/prisma.js";

export const dashboardService = {
  async getSummary() {
    const [productCount, orderCount, postCount, contactMessageCount, latestOrders] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.post.count(),
        prisma.contactMessage.count(),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            items: true,
          },
        }),
      ]);

    return {
      metrics: {
        productCount,
        orderCount,
        postCount,
        contactMessageCount,
      },
      latestOrders,
    };
  },
};
