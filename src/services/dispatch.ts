import { ref, push, set, get } from 'firebase/database';
import { database } from './firebase';
import { EmergencyContact } from './contacts';

export type DispatchChannel = 'APP' | 'USSD' | 'VOICE';

export interface DispatchRequest {
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: number;
  };
  timestamp: number;
  primaryContact: EmergencyContact | null;
  status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  ambulanceId?: string;
  estimatedArrivalTime?: number;
  emergencyType?: string;
  contactNumber?: string;
  channel?: DispatchChannel;
}

class DispatchService {
  private readonly DISPATCH_PATH = 'dispatches';

  async dispatch(request: DispatchRequest): Promise<boolean> {
    try {
      await this.sendDispatchRequest(request);
      return true;
    } catch (error) {
      console.error('Error dispatching:', error);
      return false;
    }
  }

  async sendDispatchRequest(request: DispatchRequest): Promise<string> {
    try {
      const dispatchRef = ref(database, this.DISPATCH_PATH);
      const newDispatchRef = push(dispatchRef);
      
      const dispatchData = {
        ...request,
        status: 'pending',
        createdAt: Date.now(),
      };

      await set(newDispatchRef, dispatchData);
      return newDispatchRef.key || '';
    } catch (error) {
      console.error('Error sending dispatch request:', error);
      throw error;
    }
  }

  async getDispatchStatus(dispatchId: string): Promise<DispatchRequest | null> {
    try {
      const dispatchRef = ref(database, `${this.DISPATCH_PATH}/${dispatchId}`);
      const snapshot = await get(dispatchRef);
      
      if (!snapshot.exists()) {
        return null;
      }

      return snapshot.val();
    } catch (error) {
      console.error('Error getting dispatch status:', error);
      throw error;
    }
  }

  async updateDispatchStatus(
    dispatchId: string,
    status: DispatchRequest['status'],
    updates: Partial<DispatchRequest> = {}
  ): Promise<void> {
    try {
      const dispatchRef = ref(database, `${this.DISPATCH_PATH}/${dispatchId}`);
      const snapshot = await get(dispatchRef);
      
      if (!snapshot.exists()) {
        throw new Error('Dispatch not found');
      }

      const currentData = snapshot.val();
      const updatedData = {
        ...currentData,
        ...updates,
        status,
        updatedAt: Date.now(),
      };

      await set(dispatchRef, updatedData);
    } catch (error) {
      console.error('Error updating dispatch status:', error);
      throw error;
    }
  }

  async cancelDispatch(dispatchId: string): Promise<void> {
    try {
      await this.updateDispatchStatus(dispatchId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling dispatch:', error);
      throw error;
    }
  }

  async assignAmbulance(
    dispatchId: string,
    ambulanceId: string,
    estimatedArrivalTime: number
  ): Promise<void> {
    try {
      await this.updateDispatchStatus(dispatchId, 'accepted', {
        ambulanceId,
        estimatedArrivalTime,
      });
    } catch (error) {
      console.error('Error assigning ambulance:', error);
      throw error;
    }
  }

  async startTransport(dispatchId: string): Promise<void> {
    try {
      await this.updateDispatchStatus(dispatchId, 'in_progress');
    } catch (error) {
      console.error('Error starting transport:', error);
      throw error;
    }
  }

  async completeDispatch(dispatchId: string): Promise<void> {
    try {
      await this.updateDispatchStatus(dispatchId, 'completed');
    } catch (error) {
      console.error('Error completing dispatch:', error);
      throw error;
    }
  }
}

export const dispatchService = new DispatchService(); 