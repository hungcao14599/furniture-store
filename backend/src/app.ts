import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { setupSwagger } from "./docs/swagger.js";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware.js";
import { apiRouter } from "./routes/index.js";

export const app = express();

app.set("trust proxy", 1);

const allowedOrigins = env.FRONTEND_URL.split(",").map((origin) => origin.trim());
const uploadsDirectory = path.resolve(process.cwd(), "uploads");

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: null,
      },
    },
  }),
);
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDirectory));
setupSwagger(app);

app.get("/health", (_request, response) => {
  response.json({
    success: true,
    message: "Backend is healthy",
  });
});

app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
