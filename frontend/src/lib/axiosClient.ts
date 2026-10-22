import axios from 'axios';

// API base path — empty in dev (proxied by Vite), or set by config in production.
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth is handled entirely via the HttpOnly cookie (withCredentials: true above).
// No localStorage token injection — that created a secondary auth path that
// persisted past logout, causing the "still logged in after reload" bug.

// Extract a human-readable error message from all failed responses.
axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.data) {
      const data = error.response.data as Record<string, unknown>;

      // Validation errors: { field: "message", ... }
      if (typeof data === 'object' && !data.message && !data.status) {
        const messages = Object.values(data).join(', ');
        return Promise.reject(new Error(messages));
      }

      // APIException / ResourceNotFoundException: { message: "...", status: bool }
      if (typeof data.message === 'string') {
        return Promise.reject(new Error(data.message));
      }
    }
    return Promise.reject(error);
  }
);
