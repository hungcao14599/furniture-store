import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { embeddingService } from "./embedding.service.js";

const productEmbeddingInclude = {
  category: true,
} satisfies Prisma.ProductInclude;

type ProductForEmbedding = Prisma.ProductGetPayload<{
  include: typeof productEmbeddingInclude;
}>;

type ProductSimilarityMatch = {
  productId: string;
  score: number;
};

type SyncResult = {
  status: "failed" | "skipped" | "synced";
  reason?: string;
};

let hasWarnedAboutVectorInfra = false;

const warnVectorInfra = (message: string) => {
  if (hasWarnedAboutVectorInfra) {
    return;
  }

  hasWarnedAboutVectorInfra = true;
  console.warn(`[vector-search] ${message}`);
};

const isVectorInfraError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("productembedding") ||
    message.includes("type \"vector\" does not exist") ||
    message.includes("extension \"vector\"") ||
    message.includes("operator does not exist") ||
    message.includes("function cosine") ||
    message.includes("relation \"productembedding\" does not exist")
  );
};

const formatVectorLiteral = (values: number[]) => `[${values.map((value) => Number(value.toFixed(8))).join(",")}]`;

const stringifySpecificationValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return JSON.stringify(value);
};

const buildSpecificationSummary = (value: Prisma.JsonValue) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "";
  }

  return Object.entries(value as Record<string, Prisma.JsonValue>)
    .map(([key, entryValue]) => `${key}: ${stringifySpecificationValue(entryValue)}`)
    .filter(Boolean)
    .join("; ");
};

const buildProductSourceText = (product: ProductForEmbedding) =>
  [
    `Ten san pham: ${product.name}`,
    `Danh muc: ${product.category.name}`,
    `SKU: ${product.sku}`,
    `Mo ta ngan: ${product.shortDescription}`,
    `Mo ta chi tiet: ${product.description}`,
    `Chat lieu: ${product.material}`,
    `Mau sac: ${product.color}`,
    `Kich thuoc: ${product.dimensions}`,
    `Thong so: ${buildSpecificationSummary(product.specifications)}`,
    `Gia: ${product.price.toString()} VND`,
    `San pham noi bat: ${product.featured ? "co" : "khong"}`,
    `Ban chay: ${product.bestSeller ? "co" : "khong"}`,
    `Moi: ${product.isNew ? "co" : "khong"}`,
  ]
    .filter(Boolean)
    .join("\n");

const upsertProductEmbedding = async (productId: string, sourceText: string, embedding: number[]) => {
  const embeddingLiteral = formatVectorLiteral(embedding);

  await prisma.$executeRaw`
    INSERT INTO "ProductEmbedding" ("productId", "sourceText", "embedding", "createdAt", "updatedAt")
    VALUES (${productId}, ${sourceText}, CAST(${embeddingLiteral} AS vector), NOW(), NOW())
    ON CONFLICT ("productId")
    DO UPDATE SET
      "sourceText" = EXCLUDED."sourceText",
      "embedding" = EXCLUDED."embedding",
      "updatedAt" = NOW()
  `;
};

export const productEmbeddingService = {
  isEnabled() {
    return embeddingService.isEnabled();
  },

  async syncProductEmbedding(productId: string): Promise<SyncResult> {
    if (!embeddingService.isEnabled()) {
      return {
        status: "skipped",
        reason: "Embedding provider chưa được cấu hình.",
      };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: productEmbeddingInclude,
    });

    if (!product) {
      return {
        status: "skipped",
        reason: "Sản phẩm không tồn tại.",
      };
    }

    const sourceText = buildProductSourceText(product);

    try {
      const embedding = await embeddingService.createEmbedding(sourceText, {
        taskType: "RETRIEVAL_DOCUMENT",
        title: product.name,
      });
      await upsertProductEmbedding(product.id, sourceText, embedding);

      return {
        status: "synced",
      };
    } catch (error) {
      if (isVectorInfraError(error)) {
        warnVectorInfra("Chưa có bảng/vector extension cho ProductEmbedding. Hệ thống sẽ fallback về keyword search.");

        return {
          status: "skipped",
          reason: "Vector infrastructure chưa sẵn sàng.",
        };
      }

      throw error;
    }
  },

  async syncAllProductEmbeddings() {
    const products = await prisma.product.findMany({
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });

    let synced = 0;
    let skipped = 0;
    let failed = 0;

    for (const product of products) {
      try {
        const result = await this.syncProductEmbedding(product.id);

        if (result.status === "synced") {
          synced += 1;
        } else {
          skipped += 1;
        }
      } catch (error) {
        failed += 1;
        console.error(`[vector-search] sync embedding failed for product ${product.id}`, error);
      }
    }

    return {
      total: products.length,
      synced,
      skipped,
      failed,
    };
  },

  async searchSimilarProducts(message: string, limit = env.CHATBOT_VECTOR_RESULT_LIMIT) {
    if (!embeddingService.isEnabled()) {
      return [] as ProductSimilarityMatch[];
    }

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return [] as ProductSimilarityMatch[];
    }

    try {
      const queryEmbedding = await embeddingService.createEmbedding(trimmedMessage, {
        taskType: "RETRIEVAL_QUERY",
      });
      const embeddingLiteral = formatVectorLiteral(queryEmbedding);
      const rows = await prisma.$queryRaw<ProductSimilarityMatch[]>`
        SELECT
          "productId",
          GREATEST(0, 1 - ("embedding" <=> CAST(${embeddingLiteral} AS vector)))::double precision AS "score"
        FROM "ProductEmbedding"
        WHERE "embedding" IS NOT NULL
        ORDER BY "embedding" <=> CAST(${embeddingLiteral} AS vector) ASC
        LIMIT ${limit}
      `;

      return rows.filter((row) => row.score >= env.CHATBOT_VECTOR_MIN_SCORE);
    } catch (error) {
      if (isVectorInfraError(error)) {
        warnVectorInfra("Vector search chưa được migrate đầy đủ. Chatbot đang dùng keyword search.");
        return [] as ProductSimilarityMatch[];
      }

      console.error("[vector-search] similarity search failed", error);
      return [] as ProductSimilarityMatch[];
    }
  },
};
