import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage wrapper that works on both web and mobile
class StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.clear();
      return;
    }
    return AsyncStorage.clear();
  }

  async getAllKeys(): Promise<string[]> {
    if (Platform.OS === 'web') {
      // Get all keys from localStorage
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    }
    return AsyncStorage.getAllKeys();
  }
}

export const storage = new StorageAdapter();
