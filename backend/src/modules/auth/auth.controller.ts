import type { RequestHandler } from "express";
import { ok } from "../../http/response.js";

// Persistent storage is temporarily disabled. Route validation and authorization remain active.

export {
  storageUnavailable as registerUser,
  storageUnavailable as loginUser,
  storageUnavailable as getCurrentUser,
} from "../../http/storage-unavailable.js";

export const logoutUser: RequestHandler = (_request, response) => {
  ok(response, { message: "Logged out. Remove the token from the client." });
};
