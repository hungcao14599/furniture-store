import { Router } from "express";
import { adminRouter } from "./admin.routes.js";
import { publicRouter } from "./public.routes.js";

export const apiRouter = Router();

apiRouter.use("/", publicRouter);
apiRouter.use("/admin", adminRouter);
