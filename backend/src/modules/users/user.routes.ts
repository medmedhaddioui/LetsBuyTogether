import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { auth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import * as controller from "./user.controller.js";

import { profileSchema } from "./user.schemas.js";

export const userRoutes = Router();
userRoutes.get("/me/favorites", auth, asyncHandler(controller.listFavorites));
userRoutes.get("/me/history", auth, asyncHandler(controller.getPurchaseHistory));
userRoutes.patch("/me", auth, validate(profileSchema), asyncHandler(controller.updateProfile));
userRoutes.post("/:id/block", auth, asyncHandler(controller.blockUser));
userRoutes.delete("/:id/block", auth, asyncHandler(controller.unblockUser));
userRoutes.get("/:id/reviews", asyncHandler(controller.listUserReviews));
userRoutes.get("/:username", asyncHandler(controller.getPublicProfile));
