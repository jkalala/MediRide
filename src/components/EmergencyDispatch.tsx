import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Card } from 'react-native-paper';
import { dispatchService, DispatchChannel } from '../services/dispatch';
import * as Location from 'expo-location';

interface EmergencyDispatchProps {
  onDispatchComplete?: (success: boolean) => void;
}

export default function EmergencyDispatch({ onDispatchComplete }: EmergencyDispatchProps) {
  const [loading, setLoading] = useState(false);

  const handleDispatch = async (channel: DispatchChannel) => {
    try {
      setLoading(true);

      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for emergency dispatch.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      const request = {
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        emergencyType: 'Medical Emergency',
        contactNumber: '1234567890', // Replace with actual user's contact
        channel,
      };

      const success = await dispatchService.dispatch(request);
      
      if (success) {
        Alert.alert('Success', 'Emergency services have been notified.');
      } else {
        Alert.alert('Error', 'Failed to dispatch emergency services. Please try again.');
      }

      onDispatchComplete?.(success);
    } catch (error) {
      console.error('Dispatch error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      onDispatchComplete?.(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={styles.container}>
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>Emergency Dispatch</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Choose your preferred dispatch method:
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => handleDispatch('APP')}
            loading={loading}
            style={styles.button}
            icon="cellphone"
          >
            Dispatch via App
          </Button>

          <Button
            mode="contained"
            onPress={() => handleDispatch('USSD')}
            loading={loading}
            style={styles.button}
            icon="phone"
          >
            Dispatch via USSD
          </Button>

          <Button
            mode="contained"
            onPress={() => handleDispatch('VOICE')}
            loading={loading}
            style={styles.button}
            icon="phone-alert"
          >
            Call Emergency
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
}); 