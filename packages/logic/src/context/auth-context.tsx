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
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') {
        setLoading(false);
        return;
    }
    
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decodedToken: { sub: string; username: string; email: string; exp: number } = jwtDecode(token);
        
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
            localStorage.removeItem('authToken');
            setUser(null);
        } else {
            setUser({ id: decodedToken.sub, username: decodedToken.username, email: decodedToken.email });
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('authToken', token);
    try {
      const decodedToken: { sub: string; username: string; email: string } = jwtDecode(token);
      setUser({ id: decodedToken.sub, username: decodedToken.username, email: decodedToken.email });
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
        console.error('Invalid token on login:', error);
        setUser(null);
    }
  };

  const logout = () => {
    performLogout(); // This removes the token from localStorage
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
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
