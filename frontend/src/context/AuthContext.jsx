import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('linguamate_token') || null);
  const [preferences, setPreferences] = useState({
    speech_rate: 1.0,
    speech_pitch: 1.0,
    theme: 'dark',
    target_language: 'en',
    selected_voice: 'default',
  });
  const [loading, setLoading] = useState(true);

  // Strictly verify session with backend /auth/me on startup
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('linguamate_token');
      if (storedToken) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res?.success && res?.user) {
            setUser(res.user);
            setToken(storedToken);
            localStorage.setItem('linguamate_user', JSON.stringify(res.user));
            if (res.preferences) {
              setPreferences(res.preferences);
            }
          } else {
            setToken(null);
            setUser(null);
            localStorage.removeItem('linguamate_token');
            localStorage.removeItem('linguamate_user');
          }
        } catch (err) {
          console.warn('[Auth verification rejected]:', err.message);
          setToken(null);
          setUser(null);
          localStorage.removeItem('linguamate_token');
          localStorage.removeItem('linguamate_user');
        }
      } else {
        setToken(null);
        setUser(null);
        localStorage.removeItem('linguamate_user');
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('linguamate_token', res.token);
      localStorage.setItem('linguamate_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async ({ email, password, fullName, preferredLanguage, role }) => {
    const res = await apiClient.post('/auth/register', {
      email,
      password,
      fullName,
      preferredLanguage: preferredLanguage || 'en',
      role: role || 'user',
    });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('linguamate_token', res.token);
      localStorage.setItem('linguamate_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('linguamate_token');
    localStorage.removeItem('linguamate_user');
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const res = await apiClient.put('/auth/preferences', newPrefs);
      if (res.success) {
        setPreferences((prev) => ({ ...prev, ...newPrefs }));
      }
      return res;
    } catch (err) {
      setPreferences((prev) => ({ ...prev, ...newPrefs }));
    }
  };

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        preferences,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updatePreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
