import sharp from "sharp";
import type { RequestHandler } from "express";
import { AppError } from "../../http/app-error.js";
import { ok } from "../../http/response.js";
import { AuthRepository } from "./auth.repository.js";

export const uploadAvatar: RequestHandler = async (request, response) => {
  if (!Buffer.isBuffer(request.body) || request.body.length === 0) {
    throw new AppError(415, "INVALID_IMAGE", "Choose a JPEG, PNG or WebP photo.");
  }
  let image: Buffer;
  try {
    const source = sharp(request.body, { limitInputPixels: 16_000_000, animated: false });
    const metadata = await source.metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format))
      throw new Error("Unsupported format");
    // Decode and re-encode; discard metadata and never store the supplied file name.
    image = await source
      .rotate()
      .resize(256, 256, { fit: "cover" })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    throw new AppError(
      400,
      "INVALID_IMAGE",
      "This photo could not be read. Choose a JPEG, PNG or WebP image under 16 megapixels.",
    );
  }
  const user = await AuthRepository.saveAvatar(request.user!.id, image);
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Your session is no longer valid.");
  response.set("Cache-Control", "no-store");
  ok(response, { user });
};

export const readAvatar: RequestHandler = async (request, response) => {
  const image = await AuthRepository.getAvatar(request.user!.id);
  if (!image) throw new AppError(404, "NOT_FOUND", "No profile photo has been uploaded.");
  response.set("Cache-Control", "private, no-store");
  response.type("image/webp").send(image);
};

export const deleteAvatar: RequestHandler = async (request, response) => {
  const user = await AuthRepository.saveAvatar(request.user!.id, null);
  if (!user) throw new AppError(401, "UNAUTHORIZED", "Your session is no longer valid.");
  response.set("Cache-Control", "no-store");
  ok(response, { user });
};
