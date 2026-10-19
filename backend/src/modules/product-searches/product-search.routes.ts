import { requireProfile } from "../auth/require-profile.js";
import { Router } from "express";
import { auth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import { asyncHandler } from "../../http/async-handler.js";
import { createSearchSchema, searchStatusSchema } from "./product-search.schemas.js";
import * as controller from "./product-search.controller.js";

export const productSearchRoutes = Router();
productSearchRoutes.use(auth, requireProfile);
productSearchRoutes.get("/mine", asyncHandler(controller.listMine));
productSearchRoutes.post("/", validate(createSearchSchema), asyncHandler(controller.createSearch));
productSearchRoutes.patch(
  "/:id/status",
  validate(searchStatusSchema),
  asyncHandler(controller.changeStatus),
);
