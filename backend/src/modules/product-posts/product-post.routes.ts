import { requireProfile } from "../auth/require-profile.js";
import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import { asyncHandler } from "../../http/async-handler.js";
import { createPostSchema, postStatusSchema } from "./product-post.schemas.js";
import * as controller from "./product-post.controller.js";

export const productPostRoutes = Router();
productPostRoutes.get("/", asyncHandler(controller.browsePosts));
productPostRoutes.get("/mine", auth, requireProfile, asyncHandler(controller.listMine));
productPostRoutes.post(
  "/",
  auth,
  requireProfile,
  validate(createPostSchema),
  asyncHandler(controller.createPost),
);
productPostRoutes.patch(
  "/:id/status",
  auth,
  requireProfile,
  validate(postStatusSchema),
  asyncHandler(controller.changeStatus),
);
