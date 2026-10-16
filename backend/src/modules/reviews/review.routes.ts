import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { auth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import * as controller from "./review.controller.js";

import { reviewSchema } from "./review.schemas.js";

export const reviewRoutes = Router();
reviewRoutes.post("/", auth, validate(reviewSchema), asyncHandler(controller.createReview));
