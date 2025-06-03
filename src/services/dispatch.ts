import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { makePhoneCall } from 'react-native-phone-call';

export type DispatchChannel = 'APP' | 'USSD' | 'VOICE';

export interface DispatchRequest {
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  emergencyType: string;
  description?: string;
  contactNumber: string;
  channel: DispatchChannel;
}

class DispatchService {
  private readonly USSD_CODE = '*123#'; // Replace with your actual USSD code
  private readonly EMERGENCY_NUMBER = '911'; // Replace with your actual emergency number

  async dispatch(request: DispatchRequest): Promise<boolean> {
    try {
      switch (request.channel) {
        case 'APP':
          return await this.dispatchViaApp(request);
        case 'USSD':
          return await this.dispatchViaUSSD(request);
        case 'VOICE':
          return await this.dispatchViaVoice(request);
        default:
          throw new Error('Invalid dispatch channel');
      }
    } catch (error) {
      console.error('Dispatch error:', error);
      return false;
    }
  }

  private async dispatchViaApp(request: DispatchRequest): Promise<boolean> {
    // Implement your app-based dispatch logic here
    // This could involve sending data to your backend
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      return response.ok;
    } catch (error) {
      console.error('App dispatch error:', error);
      return false;
    }
  }

  private async dispatchViaUSSD(request: DispatchRequest): Promise<boolean> {
    try {
      const ussdUrl = `tel:${this.USSD_CODE}`;
      const canOpen = await Linking.canOpenURL(ussdUrl);
      
      if (canOpen) {
        await Linking.openURL(ussdUrl);
        return true;
      }
      return false;
    } catch (error) {
      console.error('USSD dispatch error:', error);
      return false;
    }
  }

  private async dispatchViaVoice(request: DispatchRequest): Promise<boolean> {
    try {
      const args = {
        number: this.EMERGENCY_NUMBER,
        prompt: true,
      };
      
      await makePhoneCall(args);
      return true;
    } catch (error) {
      console.error('Voice dispatch error:', error);
      return false;
    }
  }
}

export const dispatchService = new DispatchService(); 