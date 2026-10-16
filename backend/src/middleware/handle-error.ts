import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../http/app-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
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
