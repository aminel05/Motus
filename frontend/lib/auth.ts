import axios from "axios";
import { api, getCsrfCookie } from "./api";

export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function register(input: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<User> {
  await getCsrfCookie();
  const { data } = await api.post<User>("/register", input);
  return data;
}

export async function login(input: {
  email: string;
  password: string;
}): Promise<User> {
  await getCsrfCookie();
  const { data } = await api.post<User>("/login", input);
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/logout");
}

export async function fetchUser(): Promise<User | null> {
  try {
    const { data } = await api.get<User>("/user");
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null;
    }
    throw err;
  }
}
