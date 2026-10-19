import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../http/app-error.js";
import { ok } from "../../http/response.js";
import { ProductSearchRepository } from "./product-search.repository.js";

export const listMine: RequestHandler = async (request, response) => {
  response.set("Cache-Control", "no-store");
  ok(response, await ProductSearchRepository.listMine(request.user!.id));
};

export const createSearch: RequestHandler = async (request, response) => {
  ok(response, await ProductSearchRepository.create(request.user!.id, request.body), 201);
};

export const changeStatus: RequestHandler = async (request, response) => {
  const id = z.string().uuid().parse(request.params.id);
  const search = await ProductSearchRepository.updateStatus(
    request.user!.id,
    id,
    request.body.status,
  );
  if (!search) throw new AppError(404, "NOT_FOUND", "Search request not found.");
  ok(response, search);
};
