import { Router } from "express";
import { asyncHandler } from "../../http/async-handler.js";

import * as controller from "./store.controller.js";

export const storeRoutes = Router();
storeRoutes.get("/", asyncHandler(controller.listStores));
storeRoutes.get("/:id", asyncHandler(controller.getStore));
