import axios from 'axios';

// Smart API Base URL resolver:
// 1. If running on localhost / 127.0.0.1, ALWAYS use local backend relative /api
// 2. In production, use VITE_API_BASE_URL (ignoring placeholder un-deployed render URLs)
function resolveApiBaseUrl() {
  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.') ||
      window.location.hostname.startsWith('10.'));

  if (isLocal) {
    return '/api';
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('linguamate-api.onrender.com')) {
    return envUrl;
  }

  return '/api';
}

const API_BASE_URL = resolveApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: Attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linguamate_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract data or format error
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.error || error.message || 'Something went wrong',
      status: error.response?.status,
      details: error.response?.data?.details,
    };

    if (error.response?.status === 401 || (error.response?.status === 403 && error.response?.data?.error?.includes('token'))) {
      localStorage.removeItem('linguamate_token');
      localStorage.removeItem('linguamate_user');
    }

    return Promise.reject(customError);
  }
);

export default apiClient;
