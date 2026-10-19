import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../http/app-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err?.type === "entity.too.large")
    return void res.status(413).json({
      success: false,
      error: {
        code: "UPLOAD_TOO_LARGE",
        message: "The file is too large. Choose an image under 2 MB.",
      },
    });
  if (err instanceof AppError)
    return void res
      .status(err.status)
      .json({ success: false, error: { code: err.code, message: err.message } });
  if (err instanceof ZodError)
    return void res.status(400).json({
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Invalid request", details: err.flatten() },
    });
  console.error(err);
  res.status(500).json({
    success: false,
    error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred." },
  });
};
