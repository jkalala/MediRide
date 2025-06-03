import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { DispatchRequest } from './dispatch';

interface OfflineQueueItem {
  id: string;
  timestamp: number;
  request: DispatchRequest;
  retryCount: number;
}

class StorageService {
  private readonly OFFLINE_QUEUE_KEY = '@mediride:offline_queue';
  private readonly USER_DATA_KEY = '@mediride:user_data';

  async saveToOfflineQueue(request: DispatchRequest): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const newItem: OfflineQueueItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        request,
        retryCount: 0,
      };
      
      queue.push(newItem);
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving to offline queue:', error);
      throw error;
    }
  }

  async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    try {
      const queue = await AsyncStorage.getItem(this.OFFLINE_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Error getting offline queue:', error);
      return [];
    }
  }

  async removeFromOfflineQueue(id: string): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const updatedQueue = queue.filter(item => item.id !== id);
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error removing from offline queue:', error);
      throw error;
    }
  }

  async updateRetryCount(id: string): Promise<void> {
    try {
      const queue = await this.getOfflineQueue();
      const updatedQueue = queue.map(item => {
        if (item.id === id) {
          return { ...item, retryCount: item.retryCount + 1 };
        }
        return item;
      });
      await AsyncStorage.setItem(this.OFFLINE_QUEUE_KEY, JSON.stringify(updatedQueue));
    } catch (error) {
      console.error('Error updating retry count:', error);
      throw error;
    }
  }

  async saveUserData(data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  }

  async getUserData(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.USER_DATA_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async clearUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.USER_DATA_KEY);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  }

  async isOnline(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected ?? false;
    } catch (error) {
      console.error('Error checking network status:', error);
      return false;
    }
  }
}

export const storageService = new StorageService(); 