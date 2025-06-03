import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { dispatchService, DispatchRequest } from '../../services/dispatch';
import { useAuth } from '../../hooks/useAuth';
import * as Location from 'expo-location';

export default function EmergencyScreen() {
  const [loading, setLoading] = useState(false);
  const [activeDispatch, setActiveDispatch] = useState<DispatchRequest | null>(null);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    // In a real app, you would fetch the active dispatch from your backend
    // and set up real-time updates
    const checkActiveDispatch = async () => {
      try {
        // This is a placeholder - you would implement actual dispatch fetching
        const dispatch = null; // await dispatchService.getActiveDispatch(user?.uid);
        setActiveDispatch(dispatch);
      } catch (error) {
        console.error('Error checking active dispatch:', error);
      }
    };

    checkActiveDispatch();
  }, [user]);

  const handleEmergencyRequest = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to request emergency transport.'
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const dispatchRequest: DispatchRequest = {
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy || undefined,
          timestamp: location.timestamp,
        },
        timestamp: Date.now(),
        primaryContact: null, // This would be set from user's emergency contacts
      };

      const dispatchId = await dispatchService.sendDispatchRequest(dispatchRequest);
      setActiveDispatch({ ...dispatchRequest, status: 'pending' });
      
      Alert.alert(
        'Emergency Request Sent',
        'Help is on the way. Stay calm and stay in your location.',
        [
          {
            text: 'View Status',
            onPress: () => navigation.navigate('EmergencyMain' as never),
          },
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Error sending emergency request:', error);
      Alert.alert(
        'Error',
        'Failed to send emergency request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDispatch = async () => {
    if (!activeDispatch) return;

    Alert.alert(
      'Cancel Emergency Request',
      'Are you sure you want to cancel this emergency request?',
      [
        {
          text: 'No, Keep Request',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // await dispatchService.cancelDispatch(activeDispatch.id);
              setActiveDispatch(null);
              Alert.alert('Success', 'Emergency request cancelled successfully.');
            } catch (error) {
              console.error('Error cancelling dispatch:', error);
              Alert.alert('Error', 'Failed to cancel emergency request.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency Services</Text>
        <Text style={styles.subtitle}>Quick access to emergency transport</Text>
      </View>

      {activeDispatch ? (
        <View style={styles.activeDispatchContainer}>
          <View style={styles.statusHeader}>
            <MaterialIcons name="local-hospital" size={24} color="#FF4B4B" />
            <Text style={styles.statusTitle}>Active Emergency Request</Text>
          </View>

          <View style={styles.statusDetails}>
            <Text style={styles.statusText}>
              Status: {activeDispatch.status?.toUpperCase()}
            </Text>
            {activeDispatch.estimatedArrivalTime && (
              <Text style={styles.etaText}>
                ETA: {new Date(activeDispatch.estimatedArrivalTime).toLocaleTimeString()}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.cancelButton, loading && styles.cancelButtonDisabled]}
            onPress={handleCancelDispatch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.emergencyButton, loading && styles.emergencyButtonDisabled]}
          onPress={handleEmergencyRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <MaterialIcons name="local-hospital" size={32} color="#FFFFFF" />
              <Text style={styles.emergencyButtonText}>Request Emergency Transport</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EmergencyContacts' as never)}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.addContactButton}
          onPress={() => navigation.navigate('AddContact' as never)}
        >
          <MaterialIcons name="add" size={24} color="#FF4B4B" />
          <Text style={styles.addContactText}>Add Emergency Contact</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Emergency Information</Text>
        <View style={styles.infoCard}>
          <MaterialIcons name="info" size={24} color="#FF4B4B" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>What to do in an emergency:</Text>
            <Text style={styles.infoText}>
              1. Stay calm and assess the situation{'\n'}
              2. Call emergency services if needed{'\n'}
              3. Use this app to request medical transport{'\n'}
              4. Stay in your location until help arrives
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    backgroundColor: '#FF4B4B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 4,
  },
  activeDispatchContainer: {
    margin: 24,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FF4B4B',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4B4B',
    marginLeft: 12,
  },
  statusDetails: {
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
  },
  etaText: {
    fontSize: 16,
    color: '#666666',
  },
  cancelButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelButtonDisabled: {
    opacity: 0.7,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyButton: {
    margin: 24,
    backgroundColor: '#FF4B4B',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  emergencyButtonDisabled: {
    opacity: 0.7,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  seeAllText: {
    color: '#FF4B4B',
    fontSize: 14,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  addContactText: {
    color: '#FF4B4B',
    fontSize: 16,
    marginLeft: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
}); 