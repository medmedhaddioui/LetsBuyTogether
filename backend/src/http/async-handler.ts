import type { RequestHandler } from "express";

/** Forward rejected asynchronous handlers to the Express error middleware. */
export function asyncHandler(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    try {
      Promise.resolve(handler(request, response, next)).catch(next);
    } catch (error) {
      next(error);
    }
  };
}
