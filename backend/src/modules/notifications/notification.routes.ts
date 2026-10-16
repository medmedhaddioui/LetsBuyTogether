import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { auth } from "../../middleware/authenticate.js";

import * as controller from "./notification.controller.js";

export const notificationRoutes = Router();
notificationRoutes.get("/", auth, asyncHandler(controller.listNotifications));
notificationRoutes.patch("/read-all", auth, asyncHandler(controller.markAllRead));
notificationRoutes.patch("/:id/read", auth, asyncHandler(controller.markNotificationRead));
