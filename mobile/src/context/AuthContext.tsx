import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, authApi } from '../api/authApi';
import { secureStorage, appStorage } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { email: string; password: string; fullName: string; preferredLanguage?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = await secureStorage.getItem('auth_token');
        const storedUser = await appStorage.get<User | null>('user_profile', null);

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          // Refresh in background
          authApi.getMe().then((res) => {
            if (res.user) {
              setUser(res.user);
              appStorage.set('user_profile', res.user);
            }
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('[Auth Initialization Warning]:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, pass);
      setToken(res.token);
      setUser(res.user);
      await secureStorage.setItem('auth_token', res.token);
      await appStorage.set('user_profile', res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; fullName: string; preferredLanguage?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      setToken(res.token);
      setUser(res.user);
      await secureStorage.setItem('auth_token', res.token);
      await appStorage.set('user_profile', res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await secureStorage.removeItem('auth_token');
    await appStorage.remove('user_profile');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token && user),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

