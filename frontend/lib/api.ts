import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

export async function getCsrfCookie(): Promise<void> {
  await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
  });
}

// Narrow an unknown error (typically from an axios catch) into the JSON
// body the Laravel API sent. Returns null if the value isn't shaped like
// an axios error response.
export type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export function readApiError(err: unknown): ApiErrorBody | null {
  if (!err || typeof err !== "object" || !("response" in err)) return null;
  const data = (err as { response?: { data?: ApiErrorBody } }).response?.data;
  return data ?? null;
}
