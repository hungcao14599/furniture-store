import { Request, Response } from "express";
import { chatbotService } from "../services/chatbot.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serialize } from "../utils/serialize.js";

export const createChatbotReply = asyncHandler(async (request: Request, response: Response) => {
  const data = await chatbotService.createReply(request.body);
  response.json({
    success: true,
    data: serialize(data),
  });
});
