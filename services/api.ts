import axios from "axios";

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT (saved by useLoginForm under localStorage 'token') to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Normalize backend errors into Error(message) so callers can show err.message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error?.response?.data;
    const message =
      data?.error?.message ||
      data?.detail ||
      data?.message ||
      error?.message ||
      "Request failed";
    const wrapped = new Error(message);
    (wrapped as Error & { status?: number; data?: unknown }).status =
      error?.response?.status;
    (wrapped as Error & { status?: number; data?: unknown }).data = data;
    return Promise.reject(wrapped);
  }
);
