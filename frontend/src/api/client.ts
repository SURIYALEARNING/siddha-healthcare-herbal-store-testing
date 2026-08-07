import axios from "axios";

const baseURL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  (import.meta.env.DEV ? "http://localhost:5000" : "/");

const client = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

function isAdminRequest(url?: string): boolean {
  return Boolean(
    url && (
      /^\/api\/admin(?:\/|$)/.test(url) ||
      /^\/api\/(?:products|blogs|coupons)\/manage(?:\/|$)/.test(url)
    )
  );
}

function hasAdminAccess(): boolean {
  try {
    const user = JSON.parse(localStorage.getItem("siddha_user") || "null");
    return Boolean(localStorage.getItem("accessToken")) && user?.isAdmin === true;
  } catch {
    return false;
  }
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isAdminRequest(config.url) && !hasAdminAccess()) {
    return Promise.reject(new Error("Admin access required"));
  }

  return config;
});

let isRefreshing = false;

client.interceptors.response.use(
  (response) => {
    const toast = (window as any).__toast;
    const msg = response.data?.message;
    if (toast && msg && typeof msg === "string") {
      const status = response.status;
      if (status >= 200 && status < 300) {
        toast.showSuccess("Success", msg);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const toast = (window as any).__toast;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/logout")
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            if (!isRefreshing) {
              clearInterval(interval);
              const newToken = localStorage.getItem("accessToken");
              if (newToken) {
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                resolve(client(originalRequest));
              } else {
                resolve(Promise.reject(error));
              }
            }
          }, 100);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          client.defaults.baseURL + "/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        localStorage.setItem("accessToken", newToken);

        if (data.user) {
          localStorage.setItem("siddha_user", JSON.stringify(data.user));
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("siddha_user");
        if (toast) {
          toast.showError("Session Expired", "Please log in again.");
        }
        window.location.href = "/auth";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    const status = error.response?.status;

    if (toast) {
      if (status === 400) {
        toast.showWarning("Invalid Request", "Please check your input and try again.");
      } else if (status === 401) {
        toast.showError("Session Expired", "Please log in again.");
      } else if (status === 403) {
        toast.showError("Access Denied", "You do not have permission for this action.");
      } else if (status === 404) {
        toast.showWarning("Not Found", "The requested resource was not found.");
      } else if (status >= 500) {
        toast.showError("Something Went Wrong", "An unexpected error occurred. Please try again later.");
      }
    }

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default client;
