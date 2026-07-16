import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
