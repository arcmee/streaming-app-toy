'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../api-client';
import { logoutUser as performLogout, refreshToken as performRefresh } from '../api/auth';
import { jwtDecode } from 'jwt-decode';
import { tokenStorage } from '../auth/token-storage';
import { chatService } from '../api/chat';

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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window === 'undefined') {
        setLoading(false);
        return;
    }
    
    const storedToken = tokenStorage.get();
    if (storedToken) {
      try {
        const decodedToken: { sub: string; username: string; email: string; exp: number } = jwtDecode(storedToken);
        
        // Check if token is expired
        if (decodedToken.exp * 1000 < Date.now()) {
            tokenStorage.clear();
            setUser(null);
            setToken(null);
        } else {
            setUser({ id: decodedToken.sub, username: decodedToken.username, email: decodedToken.email });
            setToken(storedToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error('Invalid token:', error);
        tokenStorage.clear();
        setUser(null);
        setToken(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    tokenStorage.set(newToken);
    try {
      const decodedToken: { sub: string; username: string; email: string } = jwtDecode(newToken);
      setUser({ id: decodedToken.sub, username: decodedToken.username, email: decodedToken.email });
      setToken(newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      chatService.updateToken(newToken);
    } catch (error) {
        console.error('Invalid token on login:', error);
        setUser(null);
        setToken(null);
    }
  };

  const logout = () => {
    performLogout(); // This removes the token from storage
    delete apiClient.defaults.headers.common['Authorization'];
    setUser(null);
    setToken(null);
  };

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const { token: newToken } = await performRefresh();
      if (newToken) {
        const decodedToken: { sub: string; username: string; email: string } = jwtDecode(newToken);
        setUser({ id: decodedToken.sub, username: decodedToken.username, email: decodedToken.email });
        setToken(newToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        chatService.updateToken(newToken);
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
    } finally {
      setRefreshing(false);
    }
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
