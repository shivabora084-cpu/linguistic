import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const memoryStore = new Map<string, string>();

export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch {
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        memoryStore.set(key, value);
      }
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      }
      return await SecureStore.getItemAsync(key);
    } catch {
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return memoryStore.get(key) || null;
      }
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        memoryStore.delete(key);
      }
    }
  },
};

export const appStorage = {
  async set(key: string, value: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      memoryStore.set(key, JSON.stringify(value));
    }
  },

  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      const mem = memoryStore.get(key);
      return mem ? JSON.parse(mem) : fallback;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      memoryStore.delete(key);
    }
  },
};
