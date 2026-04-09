import { env } from "../config/env.js";
import { AppError } from "../utils/appError.js";
import { categoryService } from "./category.service.js";
import { contactService } from "./contact.service.js";
import { productRetrievalService } from "./productRetrieval.service.js";

type ChatbotHistoryTurn = {
  role: "assistant" | "user";
  text: string;
};

type ChatbotRequestPayload = {
  message: string;
  history?: ChatbotHistoryTurn[];
};

type ProductCandidate = Awaited<ReturnType<typeof productRetrievalService.getChatbotCandidateProducts>>[number];

type StructuredChatbotReply = {
  reply: string;
  product_ids: string[];
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
    blockReasonMessage?: string;
  };
  error?: {
    message?: string;
  };
};

const FREE_SHIPPING_THRESHOLD = 30_000_000;
const STANDARD_SHIPPING_FEE = 350_000;
const MAX_HISTORY_ITEMS = 10;
const MAX_CANDIDATE_PRODUCTS = 6;
const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "product_ids"],
  properties: {
    reply: {
      type: "string",
      description: "Câu trả lời ngắn gọn bằng tiếng Việt dành cho khách hàng.",
    },
    product_ids: {
      type: "array",
      description: "Danh sách tối đa 3 product ID lấy từ candidate products đã cung cấp.",
      items: {
        type: "string",
      },
      maxItems: 3,
    },
  },
} as const;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

const normalizeHistory = (history: ChatbotHistoryTurn[] = []) =>
  history
    .filter((item) => item.text.trim().length > 0)
    .slice(-MAX_HISTORY_ITEMS)
    .map((item) => ({
      role: item.role,
      text: item.text.trim().slice(0, 1200),
    }));

const extractGeminiText = (payload: GeminiGenerateContentResponse) => {
  const parts = payload.candidates?.[0]?.content?.parts ?? [];

  return parts
    .map((part) => part.text?.trim() ?? "")
    .filter(Boolean)
    .join("\n")
    .trim();
};

const getGeminiApiKey = () => {
  if (env.GEMINI_API_KEY) {
    return env.GEMINI_API_KEY;
  }

  if (env.OPENAI_API_KEY?.startsWith("AIza")) {
    return env.OPENAI_API_KEY;
  }

  return undefined;
};

const getCandidateProducts = async (message: string) => {
  return productRetrievalService.getChatbotCandidateProducts(message, MAX_CANDIDATE_PRODUCTS);
};

const buildStoreContext = async (message: string) => {
  const [contactInfo, categories, candidateProducts] = await Promise.all([
    contactService.getContactInfo(),
    categoryService.getPublicCategories(),
    getCandidateProducts(message),
  ]);

  const categorySummary =
    categories.length > 0
      ? categories
          .slice(0, 12)
          .map((category) => `- ${category.name} (${category.slug})`)
          .join("\n")
      : "- Chưa có danh mục khả dụng";

  const candidateSummary =
    candidateProducts.length > 0
      ? candidateProducts
          .map(
            (product) =>
              `- id=${product.id} | ten=${product.name} | danh_muc=${product.category.name} | gia=${formatCurrency(
                Number(product.price),
              )} | chat_lieu=${product.material} | mau=${product.color} | mo_ta=${product.shortDescription}`,
          )
          .join("\n")
      : "- Không có candidate product phù hợp";

  return {
    candidateProducts,
    context: `Thong tin showroom:
- Ten thuong hieu: Noi That Viet Hung
- Gio lam viec: ${contactInfo.workingHours}
- Hotline: ${contactInfo.phone}
- Email: ${contactInfo.email}
- Dia chi: ${contactInfo.address}
- Zalo: ${contactInfo.zalo ?? contactInfo.phone ?? "Khong co"}
- Phi giao hang tieu chuan: ${formatCurrency(STANDARD_SHIPPING_FEE)}
- Muc mien phi giao hang: ${formatCurrency(FREE_SHIPPING_THRESHOLD)}
- Gioi thieu: ${contactInfo.introText ?? "Khong co"}

Danh muc noi bat:
${categorySummary}

Candidate products de goi y:
${candidateSummary}`,
  };
};

const createGeminiChatReply = async (message: string, history: ChatbotHistoryTurn[]) => {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new AppError("Chatbot AI chưa được cấu hình GEMINI_API_KEY", 503);
  }

  const { candidateProducts, context } = await buildStoreContext(message);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${GEMINI_API_BASE_URL}/${env.GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: `Ban la tro ly tu van noi that cho showroom Noi That Viet Hung.
- Luon tra loi bang tieng Viet, tu nhien, ngan gon, huu ich.
- Chi su dung du lieu trong context duoc cung cap. Khong duoc tu y bịa chinh sach, gia, ton kho, khuyen mai, kich thuoc hay thong tin lien he.
- Neu du lieu chua du, noi ro la chua co thong tin chac chan va moi khach lien he showroom.
- Neu khach hoi ve san pham, co the chon toi da 3 product_ids tu danh sach candidate products.
- Neu khong co san pham phu hop, tra product_ids rong.
- Khong chen markdown, khong them ky hieu dac biet khong can thiet.`,
            },
          ],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: context,
              },
            ],
          },
          ...history.map((item) => ({
            role: item.role === "assistant" ? "model" : "user",
            parts: [
              {
                text: item.text,
              },
            ],
          })),
          {
            role: "user",
            parts: [
              {
                text: message.trim(),
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: responseSchema,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      }),
    });

    const payload = (await response.json().catch(() => null)) as GeminiGenerateContentResponse | null;

    if (!response.ok) {
      const messageFromGemini = payload?.error?.message?.trim();
      throw new AppError(messageFromGemini || "Gemini đang từ chối yêu cầu chatbot", 502);
    }

    if (!payload) {
      throw new AppError("Gemini không trả về dữ liệu hợp lệ", 502);
    }

    if (payload.promptFeedback?.blockReason) {
      throw new AppError(
        payload.promptFeedback.blockReasonMessage?.trim() ||
          `Gemini đã chặn yêu cầu chatbot: ${payload.promptFeedback.blockReason}`,
        502,
      );
    }

    const outputText = extractGeminiText(payload);

    if (!outputText) {
      throw new AppError("Gemini không trả về nội dung chatbot", 502);
    }

    let structuredReply: StructuredChatbotReply;

    try {
      structuredReply = JSON.parse(outputText) as StructuredChatbotReply;
    } catch {
      throw new AppError("Gemini trả về sai định dạng JSON cho chatbot", 502);
    }

    const productMap = new Map(candidateProducts.map((product) => [product.id, product]));
    const products = structuredReply.product_ids
      .filter((productId) => productMap.has(productId))
      .slice(0, 3)
      .map((productId) => productMap.get(productId))
      .filter((product): product is ProductCandidate => Boolean(product));

    const text = structuredReply.reply.trim();

    if (!text) {
      throw new AppError("Gemini trả về câu trả lời rỗng cho chatbot", 502);
    }

    return {
      text,
      products,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("Gemini phản hồi quá chậm cho chatbot", 504);
    }

    throw new AppError("Không thể kết nối dịch vụ Gemini cho chatbot", 502);
  } finally {
    clearTimeout(timeoutId);
  }
};

export const chatbotService = {
  async createReply(payload: ChatbotRequestPayload) {
    const history = normalizeHistory(payload.history);
    return createGeminiChatReply(payload.message, history);
  },
};
