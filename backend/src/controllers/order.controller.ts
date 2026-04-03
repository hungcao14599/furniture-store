import { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serialize } from "../utils/serialize.js";

export const createOrder = asyncHandler(async (request: Request, response: Response) => {
  const data = await orderService.createOrder(request.body);
  response.status(201).json({
    success: true,
    message: "Đặt hàng thành công",
    data: serialize(data),
  });
});

export const getOrders = asyncHandler(async (request: Request, response: Response) => {
  const data = await orderService.getOrders(request.query as Record<string, string | undefined>);
  response.json({ success: true, data: serialize(data) });
});

export const getOrderById = asyncHandler(async (request: Request, response: Response) => {
  const data = await orderService.getOrderById(String(request.params.id));
  response.json({ success: true, data: serialize(data) });
});

export const updateOrderStatus = asyncHandler(async (request: Request, response: Response) => {
  const data = await orderService.updateOrderStatus(String(request.params.id), request.body.status);
  response.json({
    success: true,
    message: "Cập nhật trạng thái đơn hàng thành công",
    data: serialize(data),
  });
});
