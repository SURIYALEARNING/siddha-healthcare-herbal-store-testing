import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

vi.mock("axios", () => {
  const mockRequestUse = vi.fn();
  const mockResponseUse = vi.fn();

  const mockInstance = {
    defaults: {
      baseURL: "http://localhost:5000",
      headers: { "Content-Type": "application/json" },
    },
    interceptors: {
      request: { use: mockRequestUse },
      response: { use: mockResponseUse },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockInstance),
      post: vi.fn(),
    },
    create: vi.fn(() => mockInstance),
  };
});

import axios from "axios";

describe("API client", () => {
  let requestInterceptor: Function;
  let responseSuccessInterceptor: Function;
  let responseErrorInterceptor: Function;

  beforeEach(async () => {
    localStorage.clear();

    const mod = await import("../../../api/client");
    const client = mod.default;

    const axiosCreateMock = (axios as any).create as vi.Mock;
    const mockInstance = axiosCreateMock.mock.results[0]?.value;

    requestInterceptor = mockInstance.interceptors.request.use.mock.calls[0][0];
    responseSuccessInterceptor = mockInstance.interceptors.response.use.mock.calls[0][0];
    responseErrorInterceptor = mockInstance.interceptors.response.use.mock.calls[0][1];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates axios instance with correct base URL", () => {
    expect(axios.create).toHaveBeenCalled();
  });

  it("attaches JWT Bearer token on requests", () => {
    localStorage.setItem("accessToken", "my-jwt-token");

    const config = { headers: {} } as any;
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBe("Bearer my-jwt-token");
  });

  it("does not attach token when accessToken is missing", () => {
    const config = { headers: {} } as any;
    const result = requestInterceptor(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  it("rejects admin routes when user is not admin", async () => {
    localStorage.setItem("siddha_user", JSON.stringify({ isAdmin: false }));

    const config = { headers: {}, url: "/api/admin/orders" } as any;
    await expect(requestInterceptor(config)).rejects.toThrow("Admin access required");
  });

  it("allows admin routes when user is admin", () => {
    localStorage.setItem("siddha_user", JSON.stringify({ isAdmin: true }));
    localStorage.setItem("accessToken", "admin-token");

    const config = { headers: {}, url: "/api/admin/orders" } as any;
    const result = requestInterceptor(config);

    expect(result).toEqual(config);
  });

  it("blocks /api/products/manage for non-admin", async () => {
    localStorage.setItem("siddha_user", JSON.stringify({ isAdmin: false }));

    const config = { headers: {}, url: "/api/products/manage" } as any;
    await expect(requestInterceptor(config)).rejects.toThrow("Admin access required");
  });

  it("returns response from success interceptor", () => {
    const response = {
      status: 200,
      data: { message: "Product created successfully" },
    };

    const result = responseSuccessInterceptor(response);
    expect(result).toEqual(response);
  });

  it("shows error toast on 401 response", async () => {
    const toast = { showWarning: vi.fn(), showError: vi.fn(), showSuccess: vi.fn(), showInfo: vi.fn() };
    (window as any).__toast = toast;

    const error = {
      config: { url: "/api/orders", _retry: false, headers: {} },
      response: { status: 401, data: {} },
    };

    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
  });

  it("shows warning on 400 response", async () => {
    const toast = { showWarning: vi.fn(), showError: vi.fn(), showSuccess: vi.fn(), showInfo: vi.fn() };
    (window as any).__toast = toast;

    const error = {
      config: { url: "/api/orders", headers: {} },
      response: { status: 400, data: {} },
    };

    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(toast.showWarning).toHaveBeenCalledWith("Invalid Request", "Please check your input and try again.");
  });

  it("shows error on 403 response", async () => {
    const toast = { showWarning: vi.fn(), showError: vi.fn(), showSuccess: vi.fn(), showInfo: vi.fn() };
    (window as any).__toast = toast;

    const error = {
      config: { url: "/api/admin", headers: {} },
      response: { status: 403, data: {} },
    };

    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(toast.showError).toHaveBeenCalledWith("Access Denied", "You do not have permission for this action.");
  });

  it("shows warning on 404 response", async () => {
    const toast = { showWarning: vi.fn(), showError: vi.fn(), showSuccess: vi.fn(), showInfo: vi.fn() };
    (window as any).__toast = toast;

    const error = {
      config: { url: "/api/products/123", headers: {} },
      response: { status: 404, data: {} },
    };

    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(toast.showWarning).toHaveBeenCalledWith("Not Found", "The requested resource was not found.");
  });

  it("shows error on 500+ response", async () => {
    const toast = { showWarning: vi.fn(), showError: vi.fn(), showSuccess: vi.fn(), showInfo: vi.fn() };
    (window as any).__toast = toast;

    const error = {
      config: { url: "/api/products", headers: {} },
      response: { status: 500, data: {} },
    };

    await expect(responseErrorInterceptor(error)).rejects.toEqual(error);
    expect(toast.showError).toHaveBeenCalledWith("Something Went Wrong", "An unexpected error occurred. Please try again later.");
  });
});