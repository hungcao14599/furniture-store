import { prisma } from "../config/prisma.js";

type ContactInfoPayload = {
  phone: string;
  email: string;
  address: string;
  facebook?: string;
  zalo?: string;
  instagram?: string;
  mapEmbedUrl?: string;
  workingHours: string;
  introText?: string;
};

type ContactMessagePayload = {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

const defaultContactInfo = {
  phone: "0901 234 567",
  email: "hello@luminamaison.com",
  address: "86 Nguyen Huu Canh, Binh Thanh, Ho Chi Minh City",
  workingHours: "08:30 - 20:00, Thứ 2 - Chủ nhật",
  introText: "Không gian trưng bày nội thất cao cấp với dịch vụ tư vấn thiết kế và đặt hàng theo yêu cầu.",
};

export const contactService = {
  async getContactInfo() {
    const contactInfo = await prisma.contactInfo.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (contactInfo) {
      return contactInfo;
    }

    return prisma.contactInfo.create({
      data: defaultContactInfo,
    });
  },

  async updateContactInfo(payload: ContactInfoPayload) {
    const existing = await prisma.contactInfo.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!existing) {
      return prisma.contactInfo.create({
        data: payload,
      });
    }

    return prisma.contactInfo.update({
      where: { id: existing.id },
      data: payload,
    });
  },

  createContactMessage(payload: ContactMessagePayload) {
    return prisma.contactMessage.create({
      data: payload,
    });
  },

  getContactMessages(query: Record<string, string | undefined>) {
    const isHandled =
      query.isHandled === undefined ? undefined : query.isHandled === "true";

    return prisma.contactMessage.findMany({
      where: {
        isHandled,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  updateContactMessageStatus(id: string, isHandled: boolean) {
    return prisma.contactMessage.update({
      where: { id },
      data: { isHandled },
    });
  },
};
