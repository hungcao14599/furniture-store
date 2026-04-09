import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";

type GeminiTaskType = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

type GeminiEmbeddingResponse = {
  embedding?: {
    values?: number[];
  };
  error?: {
    message?: string;
  };
};

type CreateEmbeddingOptions = {
  taskType: GeminiTaskType;
  title?: string;
};

const GEMINI_EMBEDDINGS_API = "https://generativelanguage.googleapis.com/v1beta/models";
const EMBEDDING_TIMEOUT_MS = 15_000;

const normalizeInput = (value: string) => value.replace(/\s+/g, " ").trim();

const getGeminiApiKey = () => {
  if (!env.GEMINI_API_KEY) {
    return undefined;
  }

  return env.GEMINI_API_KEY;
};

const normalizeVector = (values: number[]) => {
  const magnitude = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));

  if (!Number.isFinite(magnitude) || magnitude === 0) {
    return values;
  }

  return values.map((value) => value / magnitude);
};

export const embeddingService = {
  isEnabled() {
    return env.CHATBOT_VECTOR_SEARCH_ENABLED && Boolean(getGeminiApiKey());
  },

  async createEmbedding(input: string, options: CreateEmbeddingOptions) {
    const apiKey = getGeminiApiKey();

    if (!env.CHATBOT_VECTOR_SEARCH_ENABLED) {
      throw new AppError("Vector search hiện đang bị tắt trong cấu hình", 503);
    }

    if (!apiKey) {
      throw new AppError("Chưa cấu hình GEMINI_API_KEY cho embedding", 503);
    }

    const normalizedInput = normalizeInput(input);

    if (!normalizedInput) {
      throw new AppError("Nội dung embedding không được để trống", 400);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EMBEDDING_TIMEOUT_MS);

    try {
      const response = await fetch(`${GEMINI_EMBEDDINGS_API}/${env.GEMINI_EMBEDDING_MODEL}:embedContent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: `models/${env.GEMINI_EMBEDDING_MODEL}`,
          content: {
            parts: [
              {
                text: normalizedInput,
              },
            ],
          },
          taskType: options.taskType,
          title: options.title,
          outputDimensionality: env.GEMINI_EMBEDDING_DIMENSIONS,
        }),
      });

      const payload = (await response.json().catch(() => null)) as GeminiEmbeddingResponse | null;

      if (!response.ok) {
        const message = payload?.error?.message?.trim();
        throw new AppError(message || "Gemini embeddings đang từ chối yêu cầu", 502);
      }

      const embedding = payload?.embedding?.values;

      if (!embedding || embedding.length === 0) {
        throw new AppError("Gemini không trả về embedding hợp lệ", 502);
      }

      if (embedding.length !== env.GEMINI_EMBEDDING_DIMENSIONS) {
        throw new AppError(
          `Embedding dimension mismatch: expected ${env.GEMINI_EMBEDDING_DIMENSIONS}, got ${embedding.length}`,
          502,
        );
      }

      return normalizeVector(embedding);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new AppError("Gemini embeddings phản hồi quá chậm", 504);
      }

      throw new AppError("Không thể kết nối Gemini embeddings", 502);
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
