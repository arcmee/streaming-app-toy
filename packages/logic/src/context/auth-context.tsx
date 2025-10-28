'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api-client';
import { logoutUser as performLogout } from '../api/auth';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') {
        setLoading(false);
        return;
    }
    
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedToken: { sub: string; username: string; email: string; exp: number } = jwtDecode(storedToken);
        
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
            setUser(null);
            setToken(null);
        } else {
            setUser({ id: decodedToken.sub, username: decodedToken.username, email: decodedToken.email });
            setToken(storedToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('authToken');
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('authToken', newToken);
    try {
      const decodedToken: { sub: string; username: string; email: string } = jwtDecode(newToken);
      setUser({ id: decodedToken.sub, username: decodedToken.username, email: decodedToken.email });
      setToken(newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error) {
        console.error('Invalid token on login:', error);
        setUser(null);
        setToken(null);
    }
  };

  const logout = () => {
    performLogout(); // This removes the token from localStorage
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
