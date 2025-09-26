import { apiClient } from '../api-client';
import type { RegisterData, AuthResponse, LoginData } from '../domain/auth';

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/users/register', data);
  return response.data;
};

export const loginUser = async (data: LoginData): Promise<{ token: string }> => {
  const response = await apiClient.post<{ token: string }>('/api/users/login', data);
  return response.data;
};
