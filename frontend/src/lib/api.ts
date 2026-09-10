import axios, { type InternalAxiosRequestConfig } from "axios";

interface RetryConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = axios.create({
  baseURL: import.meta.env?.VITE_API_URL ?? "http://localhost:4000/api",
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || axios.isCancel(error)) throw error;
    const config = error.config as RetryConfig | undefined;
    const status = error.response?.status;
    const transient =
      status !== undefined
        ? [408, 429, 500, 502, 503, 504].includes(status)
        : ["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"].includes(
            error.code ?? "",
          );
    const attempts = config?.retryCount ?? 0;
    if (
      config &&
      ["get", "head"].includes(config.method?.toLowerCase() ?? "get") &&
      transient &&
      attempts < 2
    ) {
      const header = error.response?.headers["retry-after"];
      const seconds = typeof header === "string" ? Number(header) : NaN;
      const retryAfter =
        typeof header === "string"
          ? Number.isFinite(seconds)
            ? seconds * 1000
            : Date.parse(header) - Date.now()
          : NaN;
      // Long server-directed waits are left for the user to retry later.
      if (!Number.isFinite(retryAfter) || retryAfter <= 30_000) {
        const delay = Math.max(
          500 * 2 ** attempts + Math.random() * 250,
          retryAfter || 0,
        );
        await new Promise<void>((resolve, reject) => {
          const signal = config.signal;
          const abort = () => {
            clearTimeout(timer);
            signal?.removeEventListener?.("abort", abort);
            reject(new axios.CanceledError());
          };
          const timer = setTimeout(() => {
            signal?.removeEventListener?.("abort", abort);
            resolve();
          }, delay);
          signal?.addEventListener?.("abort", abort);
          if (signal?.aborted) abort();
        });
        config.retryCount = attempts + 1;
        return api.request(config);
      }
    }
    const serverMessage = error.response?.data?.error?.message;
    const message =
      typeof serverMessage === "string" && serverMessage.trim()
        ? serverMessage
        : status === 429
          ? "Too many requests. Please wait a moment and try again."
          : status === 401
            ? "Please log in again to continue."
            : status === 403
              ? "You do not have permission to do that."
              : status === 404
                ? "The requested item could not be found."
                : !error.response
                  ? "Unable to reach the server. Check your connection and try again."
                  : "The request could not be completed. Please try again.";
    throw new ApiError(message, status, error.code);
  },
);

export const unwrap = <T>(request: Promise<{ data: { data: T } }>) =>
  request.then((response) => response.data.data);
