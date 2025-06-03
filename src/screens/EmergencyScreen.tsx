import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { dispatchService } from '../services/dispatch';
import { locationService } from '../services/location';
import { contactService } from '../services/contacts';
import { notificationService } from '../services/notifications';

export const EmergencyScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleEmergency = async () => {
    try {
      setLoading(true);

      // Get current location
      const location = await locationService.getCurrentLocation();
      if (!location) {
        throw new Error('Could not get current location');
      }

      // Get emergency contacts
      const contacts = await contactService.getEmergencyContacts();
      const primaryContact = contacts.find(contact => contact.isPrimary);

      // Create dispatch request
      const request = {
        location,
        timestamp: Date.now(),
        primaryContact: primaryContact || null,
      };

      // Send dispatch request
      await dispatchService.sendDispatchRequest(request);

      // Notify emergency contacts
      if (primaryContact) {
        await contactService.shareLocationWithContact(primaryContact, location);
      }

      // Send push notification
      await notificationService.scheduleEmergencyNotification(
        'Emergency Dispatch',
        'Help is on the way!',
        { location }
      );

      Alert.alert(
        'Help is on the way!',
        'Emergency services have been notified and are on their way to your location.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error handling emergency:', error);
      Alert.alert(
        'Error',
        'Failed to send emergency request. Please try again or call emergency services directly.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('EmergencyContacts' as never)}
          style={styles.contactsButton}
        >
          <MaterialIcons name="people" size={24} color="#FF4B4B" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.emergencyButton, loading && styles.emergencyButtonDisabled]}
          onPress={handleEmergency}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="large" />
          ) : (
            <>
              <MaterialIcons name="local-hospital" size={48} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>EMERGENCY</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.instructions}>
          Press the button above to request emergency medical transport.
          Your location will be shared with emergency services and your primary contact.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  contactsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emergencyButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FF4B4B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonDisabled: {
    opacity: 0.7,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  instructions: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 