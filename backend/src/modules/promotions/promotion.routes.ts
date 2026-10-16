import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { auth, optionalAuth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import * as controller from "./promotion.controller.js";

import { promotionSchema } from "./promotion.schemas.js";

export const promotionRoutes = Router();
promotionRoutes.get("/", optionalAuth, asyncHandler(controller.listPromotions));
promotionRoutes.post(
  "/",
  auth,
  validate(promotionSchema),
  asyncHandler(controller.createPromotion),
);
promotionRoutes.get("/:id", optionalAuth, asyncHandler(controller.getPromotion));
promotionRoutes.get("/:id/groups", asyncHandler(controller.listPromotionGroups));
promotionRoutes.get("/:id/matches", asyncHandler(controller.findMatchingGroups));
promotionRoutes.post("/:id/favorite", auth, asyncHandler(controller.addFavorite));
promotionRoutes.delete("/:id/favorite", auth, asyncHandler(controller.removeFavorite));
