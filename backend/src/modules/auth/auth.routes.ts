import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";
import { auth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import * as controller from "./auth.controller.js";

import { loginSchema, registerSchema } from "./auth.schemas.js";

export const authRoutes = Router();
authRoutes.post("/register", validate(registerSchema), asyncHandler(controller.registerUser));
authRoutes.post("/login", validate(loginSchema), asyncHandler(controller.loginUser));
authRoutes.post("/logout", asyncHandler(controller.logoutUser));
authRoutes.get("/me", auth, asyncHandler(controller.getCurrentUser));
