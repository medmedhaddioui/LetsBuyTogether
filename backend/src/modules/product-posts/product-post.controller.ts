import type { RequestHandler } from "express";
import { z } from "zod";
import { AppError } from "../../http/app-error.js";
import { ok } from "../../http/response.js";
import { ProductPostRepository } from "./product-post.repository.js";
import { postFiltersSchema } from "./product-post.schemas.js";

export const browsePosts: RequestHandler = async (request, response) => {
  ok(response, await ProductPostRepository.listPublic(postFiltersSchema.parse(request.query)));
};

export const listMine: RequestHandler = async (request, response) => {
  response.set("Cache-Control", "no-store");
  ok(response, await ProductPostRepository.listMine(request.user!.id));
};

export const createPost: RequestHandler = async (request, response) => {
  ok(response, await ProductPostRepository.create(request.user!.id, request.body), 201);
};

export const changeStatus: RequestHandler = async (request, response) => {
  const id = z.string().uuid().parse(request.params.id);
  const post = await ProductPostRepository.updateStatus(request.user!.id, id, request.body.status);
  if (!post) throw new AppError(404, "NOT_FOUND", "Product post not found.");
  if (post === "expired")
    throw new AppError(409, "POST_EXPIRED", "Expired posts cannot be reopened.");
  ok(response, post);
};
