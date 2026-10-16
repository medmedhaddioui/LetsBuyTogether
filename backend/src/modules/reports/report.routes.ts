import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { auth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import * as controller from "./report.controller.js";

import { reportSchema } from "./report.schemas.js";

export const reportRoutes = Router();
reportRoutes.post("/", auth, validate(reportSchema), asyncHandler(controller.createReport));
