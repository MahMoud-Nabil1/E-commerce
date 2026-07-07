import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// API base path — empty in dev (proxied by Vite), or set by config in production.
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export const axiosClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);
