/**
 * Base API client built on axios.
 *
 * Authentication strategy (mobile):
 * The backend sets the JWT inside a Set-Cookie header on login.
 * React Native cannot use HttpOnly cookies reliably, so we intercept
 * the login response, extract the token value from the Set-Cookie header,
 * and persist it in expo-secure-store (encrypted, hardware-backed).
 * Every subsequent request attaches it as a Bearer token via a request
 * interceptor.
 */

import axios, {
  type AxiosRequestConfig,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import * as SecureStore from "expo-secure-store";

export const BASE_URL = "http://localhost:8080/api";
export const TOKEN_KEY = "auth_token";
/** Name of the JWT cookie the backend sets — must match spring.app.jwtCookieName */
const JWT_COOKIE_NAME = "ecommerce-cookie";

export type ApiError = {
  status: number;
  message: string;
};

const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// Attach stored JWT as Bearer token before every request.
instance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

// ─── Response interceptor ─────────────────────────────────────────────────────
// On every response, check for a Set-Cookie header containing the JWT.
// This fires on login and any future token-refresh responses.
instance.interceptors.response.use(
  async (response) => {
    const setCookie: string | string[] | undefined =
      response.headers["set-cookie"];

    if (setCookie) {
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      for (const cookie of cookies) {
        // Cookie format: "ecommerce-cookie=<token>; Path=/api; ..."
        if (cookie.startsWith(`${JWT_COOKIE_NAME}=`)) {
          const token = cookie.split(";")[0].split("=")[1];
          if (token && token.length > 0) {
            await SecureStore.setItemAsync(TOKEN_KEY, token);
          } else {
            // Empty token means the backend is clearing the cookie (logout)
            await SecureStore.deleteItemAsync(TOKEN_KEY);
          }
          break;
        }
      }
    }

    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 0;
    const message =
      error.response?.data?.message ??
      error.message ??
      `Request failed with status ${status}`;
    const apiError: ApiError = { status, message };
    return Promise.reject(apiError);
  }
);

export const apiClient = {
  get: <T>(path: string, config?: AxiosRequestConfig) =>
    instance.get<T>(path, config).then((r) => r.data),

  post: <T>(path: string, body?: unknown, config?: AxiosRequestConfig) =>
    instance.post<T>(path, body, config).then((r) => r.data),

  put: <T>(path: string, body?: unknown, config?: AxiosRequestConfig) =>
    instance.put<T>(path, body, config).then((r) => r.data),

  delete: <T>(path: string, config?: AxiosRequestConfig) =>
    instance.delete<T>(path, config).then((r) => r.data),

  /** Multipart upload — caller builds the FormData. */
  upload: <T>(path: string, formData: FormData, config?: AxiosRequestConfig) =>
    instance
      .put<T>(path, formData, {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((r) => r.data),
};
