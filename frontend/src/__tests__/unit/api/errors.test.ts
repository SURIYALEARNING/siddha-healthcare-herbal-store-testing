import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosError } from "axios";
import { ApiError, handleApiError, getErrorMessage } from "../../../api/errors";

function createAxiosError(status: number, data?: any): AxiosError {
  const config = { url: "/test" };
  const response = { status, data: data || {}, statusText: "Error", headers: {}, config };
  return new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_RESPONSE,
    config,
    undefined,
    response
  );
}

describe("ApiError", () => {
  it("stores status and message from an AxiosError with server error", () => {
    const axiosErr = createAxiosError(400, { error: "Invalid email" });
    const err = new ApiError("loginApi", axiosErr);

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.status).toBe(400);
    expect(err.serverMessage).toBe("Invalid email");
    expect(err.message).toBe("Invalid email");
  });

  it("falls back to generic message when no server error provided", () => {
    const axiosErr = createAxiosError(500, {});
    const err = new ApiError("fetchProductsApi", axiosErr);

    expect(err.status).toBe(500);
    expect(err.serverMessage).toBeNull();
    expect(err.message).toContain("fetchProductsApi");
  });

  it("handles non-Axios errors", () => {
    const genericErr = new Error("network failure");
    const err = new ApiError("someApi", genericErr);

    expect(err.status).toBe(0);
    expect(err.serverMessage).toBeNull();
    expect(err.message).toContain("someApi");
    expect(err.message).toContain("network failure");
  });

  it("uses serverMessage when it is provided", () => {
    const axiosErr = createAxiosError(422, { error: "Validation failed" });
    const err = new ApiError("registerApi", axiosErr);

    expect(err.serverMessage).toBe("Validation failed");
    expect(err.message).toBe("Validation failed");
  });
});

describe("handleApiError", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("transforms an AxiosError into an ApiError and throws", () => {
    const axiosErr = createAxiosError(401, { error: "Unauthorized" });

    expect(() => handleApiError("loginApi", axiosErr)).toThrow(ApiError);
    try {
      handleApiError("loginApi", axiosErr);
    } catch (e) {
      const apiErr = e as ApiError;
      expect(apiErr.status).toBe(401);
      expect(apiErr.serverMessage).toBe("Unauthorized");
    }
  });

  it("logs the error context to console before throwing", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const axiosErr = createAxiosError(500);

    try {
      handleApiError("testApi", axiosErr);
    } catch {}

    expect(consoleSpy).toHaveBeenCalledWith("[API] testApi:", axiosErr);
    consoleSpy.mockRestore();
  });
});

describe("getErrorMessage", () => {
  it("returns serverMessage from ApiError if available", () => {
    const axiosErr = createAxiosError(400, { error: "Bad request" });
    const apiErr = new ApiError("testApi", axiosErr);

    expect(getErrorMessage(apiErr, "fallback")).toBe("Bad request");
  });

  it("returns message from ApiError when no serverMessage", () => {
    const axiosErr = createAxiosError(500, {});
    const apiErr = new ApiError("testApi", axiosErr);

    const msg = getErrorMessage(apiErr, "fallback");
    expect(msg).not.toBe("fallback");
    expect(msg).toContain("testApi");
  });

  it("returns message from regular Error", () => {
    const err = new Error("Something broke");
    expect(getErrorMessage(err, "fallback")).toBe("Something broke");
  });

  it("returns fallback for unknown error types", () => {
    expect(getErrorMessage("some string", "fallback")).toBe("fallback");
    expect(getErrorMessage(null, "fallback")).toBe("fallback");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});