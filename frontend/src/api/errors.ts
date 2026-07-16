import { AxiosError } from "axios";

export class ApiError extends Error {
  status: number;
  serverMessage: string | null;

  constructor(context: string, cause: unknown) {
    const serverMsg = cause instanceof AxiosError
      ? cause.response?.data?.error || null
      : null;
    const message = serverMsg || `${context}: ${cause instanceof Error ? cause.message : "Unknown error"}`;
    super(message);
    this.name = "ApiError";
    this.status = cause instanceof AxiosError ? cause.response?.status || 0 : 0;
    this.serverMessage = serverMsg;
  }
}

export function handleApiError(context: string, error: unknown): never {
  console.error(`[API] ${context}:`, error);
  throw new ApiError(context, error);
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.serverMessage || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}
