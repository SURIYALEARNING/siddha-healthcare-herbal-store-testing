import { useState, useCallback } from "react";
import { User, Address } from "../types";
import { loginApi, registerApi, updateProfileApi } from "../api";
import { storage } from "../utils";
import { STORAGE_KEYS } from "../constants";
import client from "../api/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => storage.get<User>(STORAGE_KEYS.USER));
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const data = await loginApi(email, password);
      setUser(data.user);
      storage.set(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
      storage.set(STORAGE_KEYS.USER, data.user);
      return data;
    } catch (e: any) {
      const msg = e?.serverMessage || e?.message || "Login failed";
      setError(msg);
      throw e;
    }
  }, []);

  const googleAuth = useCallback((accessToken: string, userData: User) => {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storage.set(STORAGE_KEYS.USER, userData);
    setUser(userData);
  }, []);

  const register = useCallback(async (
    fullName: string, email: string, mobileNumber: string, password: string
  ) => {
    setError(null);
    try {
      await registerApi(fullName, email, mobileNumber, password);
    } catch (e: any) {
      const msg = e?.serverMessage || e?.message || "Registration failed";
      setError(msg);
      throw e;
    }
  }, []);

  const updateProfile = useCallback(async (fullName: string, mobileNumber: string, address: Address) => {
    if (!user) return;
    setError(null);
    try {
      const data = await updateProfileApi(user.id, {
        fullName, mobileNumber,
        address: address.address,
        state: address.state,
        district: address.district,
        pincode: address.pincode,
      });
      setUser(data.user);
      storage.set(STORAGE_KEYS.USER, data.user);
    } catch (e: any) {
      const msg = e?.serverMessage || e?.message || "Profile update failed";
      setError(msg);
      throw e;
    }
  }, [user]);

  const logout = useCallback(async () => {
    try {
      await client.post("/auth/logout");
    } catch {
    }
    setUser(null);
    storage.remove(STORAGE_KEYS.USER);
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  }, []);

  return { user, setUser, error, setError, login, googleAuth, register, logout, updateProfile };
}
