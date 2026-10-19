import rateLimit from "express-rate-limit";
import { env } from "../../config/env.js";
import { Router, raw } from "express";
import { uploadAvatar, readAvatar, deleteAvatar } from "./avatar.controller.js";
import { asyncHandler } from "../../http/async-handler.js";
import { auth } from "../../middleware/authenticate.js";
import { validate } from "../../middleware/validate-request.js";
import * as controller from "./auth.controller.js";

import { loginSchema, preferenceSchema, profileSchema } from "./auth.schemas.js";

import { startGoogle, finishGoogle, googleStatus } from "./google-auth.controller.js";

import {
  requireDevelopment,
  testEmailSchema,
  testSignupStatus,
  signInTestAccount,
} from "./test-auth.controller.js";

export const authRoutes = Router();
const credentialLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 20,
  standardHeaders: "draft-7",
  message: {
    success: false,
    error: {
      code: "TOO_MANY_ATTEMPTS",
      message: "Too many account requests. Please try again later.",
    },
  },
  skip: () => env.NODE_ENV === "test",
});
authRoutes.post("/register", (_request, response) => {
  response.status(410).json({
    success: false,
    error: { code: "GOOGLE_SIGNUP_REQUIRED", message: "Create your account with Google." },
  });
});
authRoutes.get("/test-signup/status", testSignupStatus);
authRoutes.post(
  "/test-signup",
  requireDevelopment,
  credentialLimit,
  validate(testEmailSchema),
  asyncHandler(signInTestAccount),
);
authRoutes.get("/google/status", googleStatus);
authRoutes.get("/google", credentialLimit, asyncHandler(startGoogle));
authRoutes.get("/google/callback", credentialLimit, asyncHandler(finishGoogle));
authRoutes.get("/avatar", auth, asyncHandler(readAvatar));
authRoutes.put(
  "/avatar",
  auth,
  credentialLimit,
  raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "2mb" }),
  asyncHandler(uploadAvatar),
);
authRoutes.delete("/avatar", auth, asyncHandler(deleteAvatar));
authRoutes.patch(
  "/profile",
  auth,
  validate(profileSchema),
  asyncHandler(controller.completeProfile),
);
authRoutes.post(
  "/login",
  credentialLimit,
  validate(loginSchema),
  asyncHandler(controller.loginUser),
);
authRoutes.post("/logout", asyncHandler(controller.logoutUser));
authRoutes.get("/me", auth, asyncHandler(controller.getCurrentUser));

authRoutes.patch(
  "/preference",
  auth,
  validate(preferenceSchema),
  asyncHandler(controller.updatePreference),
);
