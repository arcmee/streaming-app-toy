import axios from 'axios';
import { tokenStorage } from './auth/token-storage';

// It's a good practice to use environment variables for the base URL.
// Default aligns with local dockerised API (port 3000).
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 and attempt refresh once
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = tokenStorage.getRefresh();
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { refreshToken }
          );
          const newToken = refreshResponse.data.token;
          if (newToken) {
            tokenStorage.set(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            // Also update default headers
            apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // fall through to reject
        }
      }
    }
    return Promise.reject(error);
  }
);
