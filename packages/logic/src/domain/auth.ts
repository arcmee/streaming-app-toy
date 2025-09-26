// Based on server-info/API.md

// For POST /api/users/register
export interface RegisterData {
  username?: string;
  email?: string;
  password?: string;
}

// For POST /api/users/login
export interface LoginData {
  email?: string;
  password?: string;
}

// For Success Response of /api/users/register
export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
  };
  token: string;
}
