import { apiClient } from '../api-client';
import type { RegisterData, AuthResponse, LoginData } from '../domain/auth';

export const registerUser = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/users/register', data);
  return response.data;
};

export const loginUser = async (data: LoginData): Promise<{ token: string }> => {
  const response = await apiClient.post<{ token: string }>('/api/users/login', data);
  // For simplicity in this example, we use localStorage. In a real-world production app,
  // you should use a more secure storage mechanism (e.g., secure, HTTP-only cookies).
  if (response.data.token) {
    localStorage.setItem('authToken', response.data.token);
  }
  return response.data;
};

export const logoutUser = (): void => {
  localStorage.removeItem('authToken');
};
