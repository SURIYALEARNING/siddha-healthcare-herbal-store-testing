import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
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
  (error) => {
    const toast = (window as any).__toast;
    const status = error.response?.status;
    const msg = error.response?.data?.error || error.response?.data?.message || error.message;

    if (toast) {
      if (status === 400 || status === 404) {
        toast.showWarning("Warning", msg);
      } else if (status === 401 || status === 403) {
        toast.showError("Error", msg);
      } else if (status >= 500) {
        toast.showError("Server Error", msg);
      }
    }

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default client;
