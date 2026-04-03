import { Request, Response } from "express";
import { dashboardService } from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serialize } from "../utils/serialize.js";

export const getDashboardSummary = asyncHandler(async (_request: Request, response: Response) => {
  const data = await dashboardService.getSummary();
  response.json({ success: true, data: serialize(data) });
});
