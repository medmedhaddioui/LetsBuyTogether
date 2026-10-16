import type { RequestHandler } from "express";
import { AppError } from "./app-error.js";

/** Feature endpoints stay explicit while persistent storage is not configured. */
export const storageUnavailable: RequestHandler = (_request, _response, next) => {
  next(new AppError(503, "STORAGE_UNAVAILABLE", "Persistent storage is temporarily disabled."));
};
