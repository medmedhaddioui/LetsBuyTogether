import type { RequestHandler } from "express";
import { AppError } from "../../http/app-error.js";
import { asyncHandler } from "../../http/async-handler.js";
import { AuthRepository } from "./auth.repository.js";

export const requireProfile: RequestHandler = asyncHandler(async (request, _response, next) => {
  const user = await AuthRepository.findById(request.user!.id);
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Your session is no longer valid.");
  if (!user.profileComplete) {
    throw new AppError(
      403,
      "PROFILE_REQUIRED",
      "Complete your profile before searching or posting.",
    );
  }
  next();
});
