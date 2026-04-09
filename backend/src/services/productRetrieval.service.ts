import { env } from "../config/env.js";
import { productEmbeddingService } from "./productEmbedding.service.js";
import { productService } from "./product.service.js";

type ChatbotProductCandidate = Awaited<ReturnType<typeof productService.getPublicProducts>>["items"][number];

type VectorMatch = {
  productId: string;
  score: number;
};

type RankedProduct = {
  product: ChatbotProductCandidate;
  score: number;
  sources: Set<"featured" | "keyword" | "vector">;
};

const addRankedProduct = (
  bucket: Map<string, RankedProduct>,
  product: ChatbotProductCandidate,
  score: number,
  source: "featured" | "keyword" | "vector",
) => {
  const current = bucket.get(product.id);

  if (!current) {
    bucket.set(product.id, {
      product,
      score,
      sources: new Set([source]),
    });
    return;
  }

  current.score += score;
  current.sources.add(source);
};

const rankVectorMatch = (match: VectorMatch, index: number) => 120 + match.score * 100 - index * 4;
const rankKeywordMatch = (index: number) => 80 - index * 5;
const rankFeaturedFallback = (index: number) => 20 - index * 2;

export const productRetrievalService = {
  async getChatbotCandidateProducts(message: string, limit = env.CHATBOT_VECTOR_RESULT_LIMIT) {
    const trimmedMessage = message.trim();
    const [keywordProducts, featuredProducts, vectorMatches] = await Promise.all([
      trimmedMessage
        ? productService
            .getPublicProducts({
              search: trimmedMessage,
              limit: String(limit),
              sort: "featured",
            })
            .then((result) => result.items)
            .catch(() => [] as ChatbotProductCandidate[])
        : Promise.resolve([] as ChatbotProductCandidate[]),
      productService
        .getPublicProducts({
          limit: String(limit),
          sort: "featured",
        })
        .then((result) => result.items)
        .catch(() => [] as ChatbotProductCandidate[]),
      trimmedMessage
        ? productEmbeddingService.searchSimilarProducts(trimmedMessage, limit)
        : Promise.resolve([] as VectorMatch[]),
    ]);

    const vectorProducts =
      vectorMatches.length > 0
        ? await productService.getPublicProductsByIds(vectorMatches.map((match) => match.productId))
        : [];

    const vectorScoreMap = new Map(vectorMatches.map((match) => [match.productId, match]));
    const rankedProducts = new Map<string, RankedProduct>();

    vectorProducts.forEach((product, index) => {
      const match = vectorScoreMap.get(product.id);

      if (!match) {
        return;
      }

      addRankedProduct(rankedProducts, product, rankVectorMatch(match, index), "vector");
    });

    keywordProducts.forEach((product, index) => {
      addRankedProduct(rankedProducts, product, rankKeywordMatch(index), "keyword");
    });

    featuredProducts.forEach((product, index) => {
      addRankedProduct(rankedProducts, product, rankFeaturedFallback(index), "featured");
    });

    return Array.from(rankedProducts.values())
      .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name))
      .slice(0, limit)
      .map((entry) => entry.product);
  },
};
