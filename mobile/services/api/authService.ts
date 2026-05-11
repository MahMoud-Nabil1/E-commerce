import { apiClient } from "./client";
import type {
  LoginRequest,
  RegisterRequest,
  UserInfoResponse,
  MessageResponse,
} from "./types";

/**
 * Auth endpoints — all public except `getUser` and `signout`.
 * Base path: /api/auth
 */
export const authService = {
  /**
   * Authenticates the user and sets the JWT HttpOnly cookie.
   * POST /api/auth/login
   */
  login: (credentials: LoginRequest) =>
    apiClient.post<UserInfoResponse>("/auth/login", credentials),

  /**
   * Registers a new user account.
   * POST /api/auth/signup
   */
  register: (data: RegisterRequest) =>
    apiClient.post<MessageResponse>("/auth/signup", data),

  /**
   * Returns the currently authenticated user's profile.
   * GET /api/auth/user
   */
  getUser: () => apiClient.get<UserInfoResponse>("/auth/user"),

  /**
   * Returns the current user's username as a plain string.
   * GET /api/auth/username
   */
  getUsername: () => apiClient.get<string>("/auth/username"),

  /**
   * Clears the JWT cookie, logging the user out.
   * POST /api/auth/signout
   */
  signout: () => apiClient.post<MessageResponse>("/auth/signout"),

  /**
   * Returns a paginated list of all users with ROLE_SELLER.
   * GET /api/auth/sellers
   */
  getSellers: (pageNumber = 0) =>
    apiClient.get<unknown>(`/auth/sellers?pageNumber=${pageNumber}`),
};
