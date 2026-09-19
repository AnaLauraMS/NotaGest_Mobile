import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '@/domain/auth/authService';
import { SecureStorageService } from '@/core/storage/secureStorage';
import { LoginRequest, RegisterRequest } from '@/domain/auth/schemas';

interface AuthContextData {
  isAuthenticated: boolean;
  isLoading: boolean;
  userToken: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStorageService.getToken();
      if (token) {
        setUserToken(token);
        setIsAuthenticated(true);
      } else {
        setUserToken(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUserToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await AuthService.login(credentials);
    setUserToken(response.token);
    setIsAuthenticated(true);
  };

  const register = async (payload: RegisterRequest) => {
    await AuthService.register(payload);
  };

  const logout = async () => {
    await AuthService.logout();
    setUserToken(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        userToken,
        login,
        register,
        logout,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
