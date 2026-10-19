import type { ProductPostInput, ProductSearchInput } from "../schemas/product.schemas";
import type { PostResults, ProductPost, ProductSearch } from "../types/product.types";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/${path}`, {
      ...options,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("Cannot reach the server. Please try again.");
  }
  let body: { success: boolean; data: T; error?: { message: string } };
  try {
    body = await response.json();
  } catch {
    throw new Error("The server is unavailable. Please try again.");
  }
  if (!response.ok || !body.success) throw new Error(body.error?.message || "The request failed.");
  return body.data;
}

export const productsService = {
  browse: (filters: URLSearchParams, signal?: AbortSignal) =>
    request<PostResults>(`product-posts?${filters}`, { signal }),
  searches: () => request<ProductSearch[]>("product-searches/mine"),
  posts: () => request<ProductPost[]>("product-posts/mine"),
  createSearch: (input: ProductSearchInput) =>
    request<ProductSearch>("product-searches", {
      method: "POST",
      body: JSON.stringify({ ...input, productUrl: input.productUrl || undefined }),
    }),
  createPost: (input: ProductPostInput) =>
    request<ProductPost>("product-posts", {
      method: "POST",
      body: JSON.stringify({ ...input, expiresAt: new Date(input.expiresAt).toISOString() }),
    }),
  searchStatus: (id: string, status: ProductSearch["status"]) =>
    request<ProductSearch>(`product-searches/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  postStatus: (id: string, status: "open" | "full" | "cancelled") =>
    request<ProductPost>(`product-posts/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

export function matchingFilters(search: ProductSearch): URLSearchParams {
  const filters = new URLSearchParams({
    search: search.keywords,
    city: search.city,
    category: search.category,
    quantity: String(search.quantity),
  });
  if (search.maxBudget !== null) filters.set("maxBudget", String(search.maxBudget));
  return filters;
}
