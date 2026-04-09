import { config } from "dotenv";
import { z } from "zod";

config();

const optionalString = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().optional());

const optionalUrl = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}, z.string().trim().url().optional());

const booleanFromEnv = z.preprocess((value) => {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }

    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
  }

  return value;
}, z.boolean());

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().min(1).default("7d"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  GEMINI_API_KEY: optionalString,
  GEMINI_MODEL: z.string().trim().default("gemini-2.5-flash"),
  GEMINI_EMBEDDING_MODEL: z.string().trim().default("gemini-embedding-001"),
  GEMINI_EMBEDDING_DIMENSIONS: z.coerce.number().int().min(128).max(3072).default(1536),
  OPENAI_API_KEY: optionalString,
  CHATBOT_VECTOR_SEARCH_ENABLED: booleanFromEnv.default(true),
  CHATBOT_VECTOR_RESULT_LIMIT: z.coerce.number().int().min(1).max(12).default(6),
  CHATBOT_VECTOR_MIN_SCORE: z.coerce.number().min(0).max(1).default(0.55),
  ADMIN_SEED_EMAIL: z.string().email().default("admin@luminamaison.com"),
  ADMIN_SEED_PASSWORD: z.string().min(8).default("Admin@123456"),
  SUPABASE_URL: optionalUrl,
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  SUPABASE_STORAGE_BUCKET: z.string().trim().default("product-images"),
  SUPABASE_STORAGE_FOLDER: z.string().trim().default("lumina-maison"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsed.data;
