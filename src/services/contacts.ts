import * as Contacts from 'expo-contacts';
import { Platform } from 'react-native';
import { auth } from './firebase';
import { ref, set, get, remove } from 'firebase/database';
import { database } from './firebase';

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
}

class ContactService {
  private readonly CONTACTS_PATH = 'users/contacts';

  async requestPermissions(): Promise<boolean> {
    const { status } = await Contacts.requestPermissionsAsync();
    return status === 'granted';
  }

  async getDeviceContacts(): Promise<Contacts.Contact[]> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Contacts permission not granted');
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Relationships,
        ],
      });

      return data;
    } catch (error) {
      console.error('Error getting device contacts:', error);
      throw error;
    }
  }

  async saveEmergencyContact(contact: EmergencyContact): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const contactRef = ref(database, `${this.CONTACTS_PATH}/${auth.currentUser.uid}/${contact.id}`);
      await set(contactRef, contact);
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      throw error;
    }
  }

  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const contactsRef = ref(database, `${this.CONTACTS_PATH}/${auth.currentUser.uid}`);
      const snapshot = await get(contactsRef);
      
      if (!snapshot.exists()) {
        return [];
      }

      return Object.values(snapshot.val());
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      throw error;
    }
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const contactRef = ref(database, `${this.CONTACTS_PATH}/${auth.currentUser.uid}/${contactId}`);
      await remove(contactRef);
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      throw error;
    }
  }

  async setPrimaryContact(contactId: string): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('User not authenticated');
      }

      const contacts = await this.getEmergencyContacts();
      
      // Update all contacts to set isPrimary to false
      await Promise.all(
        contacts.map(contact =>
          this.saveEmergencyContact({
            ...contact,
            isPrimary: contact.id === contactId,
          })
        )
      );
    } catch (error) {
      console.error('Error setting primary contact:', error);
      throw error;
    }
  }

  async shareLocationWithContact(contact: EmergencyContact, location: { latitude: number; longitude: number }): Promise<void> {
    try {
      // Implement SMS or email sharing based on platform
      if (Platform.OS === 'ios') {
        // Use iOS sharing
        await this.shareLocationIOS(contact, location);
      } else {
        // Use Android sharing
        await this.shareLocationAndroid(contact, location);
      }
    } catch (error) {
      console.error('Error sharing location with contact:', error);
      throw error;
    }
  }

  private async shareLocationIOS(contact: EmergencyContact, location: { latitude: number; longitude: number }): Promise<void> {
    // Implement iOS-specific sharing
    // This would typically use the iOS Share Sheet or Messages framework
  }

  private async shareLocationAndroid(contact: EmergencyContact, location: { latitude: number; longitude: number }): Promise<void> {
    // Implement Android-specific sharing
    // This would typically use the Android Intent system
  }
}

export const contactService = new ContactService(); 