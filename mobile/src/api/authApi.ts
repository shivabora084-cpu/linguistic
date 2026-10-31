import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  preferredLanguage: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },

  async register(data: {
    email: string;
    password: string;
    fullName: string;
    preferredLanguage?: string;
  }): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async getMe(): Promise<{ user: User; preferences?: any }> {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  async updatePreferences(preferences: {
    speechRate?: number;
    speechPitch?: number;
    selectedVoice?: string;
    targetLanguage?: string;
    theme?: 'light' | 'dark' | 'system';
    autoPlayAudio?: boolean;
    speedMode?: 'fast' | 'balanced';
  }) {
    const res = await apiClient.put('/auth/preferences', preferences);
    return res.data;
  },
};
