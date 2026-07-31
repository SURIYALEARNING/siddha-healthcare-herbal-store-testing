import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "../../../hooks/useAuth";
import * as api from "../../../api";
import { storage } from "../../../utils";

vi.mock("../../../api", () => ({
  loginApi: vi.fn(),
  registerApi: vi.fn(),
  updateProfileApi: vi.fn(),
}));

vi.mock("../../../utils", () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
    cartKey: vi.fn(),
    wishlistKey: vi.fn(),
  },
}));

vi.mock("../../../api/client", () => ({
  default: {
    defaults: { baseURL: "http://localhost:5000" },
    post: vi.fn(),
  },
}));

const mockUser = {
  id: "user1",
  fullName: "Test User",
  email: "test@example.com",
  mobileNumber: "9876543210",
};

const mockAddress = {
  address: "123 Street",
  state: "TN",
  district: "Chennai",
  pincode: "600001",
};

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (storage.get as vi.Mock).mockReturnValue(null);
  });

  it("starts with null user and error", () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("login stores user and token", async () => {
    const loginData = { user: mockUser, accessToken: "token-123" };
    (api.loginApi as vi.Mock).mockResolvedValue(loginData);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      const data = await result.current.login("test@example.com", "password");
      expect(data).toEqual(loginData);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(storage.set).toHaveBeenCalledWith("accessToken", "token-123");
    expect(storage.set).toHaveBeenCalledWith("siddha_user", mockUser);
  });

  it("login sets error on API failure", async () => {
    (api.loginApi as vi.Mock).mockRejectedValue(new Error("Invalid credentials"));

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      try {
        await result.current.login("test@example.com", "wrong");
      } catch {}
    });

    expect(result.current.error).toBe("Invalid credentials");
    expect(result.current.user).toBeNull();
  });

  it("login uses serverMessage from ApiError", async () => {
    const apiErr = new Error("Login failed");
    (apiErr as any).serverMessage = "Account locked";
    (api.loginApi as vi.Mock).mockRejectedValue(apiErr);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      try {
        await result.current.login("test@example.com", "wrong");
      } catch {}
    });

    expect(result.current.error).toBe("Account locked");
  });

  it("register creates account", async () => {
    (api.registerApi as vi.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.register("New User", "new@example.com", "1234567890", "password");
    });

    expect(api.registerApi).toHaveBeenCalledWith("New User", "new@example.com", "1234567890", "password");
    expect(result.current.error).toBeNull();
  });

  it("register sets error on failure", async () => {
    (api.registerApi as vi.Mock).mockRejectedValue(new Error("Email already exists"));

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      try {
        await result.current.register("User", "exists@example.com", "1234567890", "password");
      } catch {}
    });

    expect(result.current.error).toBe("Email already exists");
  });

  it("updateProfile updates user", async () => {
    const updatedUser = { ...mockUser, fullName: "Updated Name" };
    (api.updateProfileApi as vi.Mock).mockResolvedValue({ user: updatedUser });

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      result.current.setUser(mockUser);
    });

    await act(async () => {
      await result.current.updateProfile("Updated Name", "9876543210", mockAddress);
    });

    expect(result.current.user?.fullName).toBe("Updated Name");
    expect(storage.set).toHaveBeenCalledWith("siddha_user", updatedUser);
  });

  it("updateProfile does nothing when user is null", async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      await result.current.updateProfile("Name", "1234567890", mockAddress);
    });

    expect(api.updateProfileApi).not.toHaveBeenCalled();
  });

  it("logout clears user and token", async () => {
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      result.current.setUser(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(storage.remove).toHaveBeenCalledWith("siddha_user");
    expect(storage.remove).toHaveBeenCalledWith("accessToken");
  });

  it("googleAuth stores token and user", async () => {
    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.googleAuth("google-token", mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(storage.set).toHaveBeenCalledWith("accessToken", "google-token");
    expect(storage.set).toHaveBeenCalledWith("siddha_user", mockUser);
  });

  it("returns error on API failure for login", async () => {
    (api.loginApi as vi.Mock).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      try {
        await result.current.login("test@example.com", "pass");
      } catch {}
    });

    expect(result.current.error).toBe("Network error");
  });
});