import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { admin, auth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import * as controller from "./admin.controller.js";

import {
  promotionModerationSchema,
  reportModerationSchema,
  storeSchema,
  storeUpdateSchema,
  userModerationSchema,
} from "./admin.schemas.js";

export const adminRoutes = Router();
adminRoutes.use(auth, admin);
adminRoutes.get("/stats", asyncHandler(controller.getStatistics));
adminRoutes.get("/users", asyncHandler(controller.listUsers));
adminRoutes.patch(
  "/users/:id",
  validate(userModerationSchema),
  asyncHandler(controller.updateUser),
);
adminRoutes.get("/promotions", asyncHandler(controller.listPromotions));
adminRoutes.patch(
  "/promotions/:id",
  validate(promotionModerationSchema),
  asyncHandler(controller.updatePromotion),
);
adminRoutes.get("/reports", asyncHandler(controller.listReports));
adminRoutes.patch(
  "/reports/:id",
  validate(reportModerationSchema),
  asyncHandler(controller.updateReport),
);
adminRoutes.post("/stores", validate(storeSchema), asyncHandler(controller.createStore));
adminRoutes.patch("/stores/:id", validate(storeUpdateSchema), asyncHandler(controller.updateStore));
