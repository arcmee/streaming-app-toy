import { apiClient } from '../api-client';
import type { RegisterData, AuthResponse, LoginData } from '../domain/auth';
import { tokenStorage } from '../auth/token-storage';

export const registerUser = async (data: RegisterData): Promise<AuthResponse & { refreshToken?: string }> => {
  const response = await apiClient.post<AuthResponse & { refreshToken?: string }>('/api/users/register', data);
  if (response.data.token) {
    tokenStorage.set(response.data.token);
  }
  if (response.data.refreshToken) {
    tokenStorage.setRefresh(response.data.refreshToken);
  }
  return response.data;
};

export const loginUser = async (
  data: LoginData
): Promise<{ token: string; refreshToken?: string }> => {
  const response = await apiClient.post<{ token: string; refreshToken?: string }>('/api/users/login', data);
  if (response.data.token) {
    tokenStorage.set(response.data.token);
  }
  if (response.data.refreshToken) {
    tokenStorage.setRefresh(response.data.refreshToken);
  }
  return response.data;
};

export const refreshToken = async (): Promise<{ token: string }> => {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) {
    throw new Error('No refresh token available');
  }
  const response = await apiClient.post<{ token: string }>('/api/auth/refresh', { refreshToken: refresh });
  if (response.data.token) {
    tokenStorage.set(response.data.token);
  }
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  const refresh = tokenStorage.getRefresh();
  try {
    if (refresh) {
      await apiClient.post('/api/auth/logout', { refreshToken: refresh });
    }
  } catch (err) {
    // Best effort; proceed to clear tokens regardless of server response
    console.warn('Failed to notify server on logout', err);
  } finally {
    tokenStorage.clear();
    tokenStorage.clearRefresh();
  }
};
