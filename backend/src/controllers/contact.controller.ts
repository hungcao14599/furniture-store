import { Request, Response } from "express";
import { contactService } from "../services/contact.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serialize } from "../utils/serialize.js";

export const getContactInfo = asyncHandler(async (_request: Request, response: Response) => {
  const data = await contactService.getContactInfo();
  response.json({ success: true, data: serialize(data) });
});

export const updateContactInfo = asyncHandler(async (request: Request, response: Response) => {
  const data = await contactService.updateContactInfo(request.body);
  response.json({
    success: true,
    message: "Cập nhật thông tin liên hệ thành công",
    data: serialize(data),
  });
});

export const createContactMessage = asyncHandler(async (request: Request, response: Response) => {
  const data = await contactService.createContactMessage(request.body);
  response.status(201).json({
    success: true,
    message: "Yêu cầu liên hệ đã được gửi",
    data: serialize(data),
  });
});

export const getContactMessages = asyncHandler(async (request: Request, response: Response) => {
  const data = await contactService.getContactMessages(request.query as Record<string, string | undefined>);
  response.json({ success: true, data: serialize(data) });
});

export const updateContactMessageStatus = asyncHandler(async (request: Request, response: Response) => {
  const data = await contactService.updateContactMessageStatus(
    String(request.params.id),
    request.body.isHandled,
  );

  response.json({
    success: true,
    message: "Đã cập nhật trạng thái liên hệ",
    data: serialize(data),
  });
});
