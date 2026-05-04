import { api } from "./api";
import type { LoginCredentials } from "../types/auth";

export const login = async (credentials: LoginCredentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

export const signup = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/signup", data);
  return res.data;
};

export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (data: {
  email: string;
  otp: string;
  new_password: string;
}) => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};