import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { auth, optionalAuth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import * as controller from "./group.controller.js";

import {
  createGroupSchema,
  groupMessageSchema,
  productSchema,
  purchaseSchema,
} from "./group.schemas.js";

export const groupRoutes = Router();
groupRoutes.get("/", optionalAuth, asyncHandler(controller.listGroups));
groupRoutes.post("/", auth, validate(createGroupSchema), asyncHandler(controller.createGroup));
groupRoutes.get("/:id", optionalAuth, asyncHandler(controller.getGroup));
groupRoutes.post("/:id/join", auth, validate(productSchema), asyncHandler(controller.joinGroup));
groupRoutes.post("/:id/leave", auth, asyncHandler(controller.leaveGroup));
groupRoutes.post("/:id/confirm", auth, asyncHandler(controller.confirmParticipation));
groupRoutes.post("/:id/payment", auth, asyncHandler(controller.confirmPayment));
groupRoutes.post(
  "/:id/purchase",
  auth,
  validate(purchaseSchema),
  asyncHandler(controller.recordPurchase),
);
groupRoutes.post("/:id/received", auth, asyncHandler(controller.confirmReceipt));
groupRoutes.post("/:id/cancel", auth, asyncHandler(controller.cancelGroup));
groupRoutes.get("/:id/messages", auth, asyncHandler(controller.listGroupMessages));
groupRoutes.post(
  "/:id/messages",
  auth,
  validate(groupMessageSchema),
  asyncHandler(controller.sendGroupMessage),
);
