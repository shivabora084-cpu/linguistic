import axios, { AxiosError } from 'axios';
import { secureStorage } from '../utils/storage';

// Production Render backend fallback or localhost for emulator
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await secureStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore token read error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Friendly error message parsing
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; error?: string }>) => {
    let message = 'An unexpected network error occurred. Please check your connection.';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message = 'Request timed out. The server is taking longer than expected to respond.';
    } else if (!error.response) {
      message = 'Cannot reach LinguaMate backend. Verify that the backend server is running.';
    }

    return Promise.reject(new Error(message));
  }
);

