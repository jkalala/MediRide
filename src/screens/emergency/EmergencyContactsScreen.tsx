import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { EmergencyContact } from '../../services/contacts';

export default function EmergencyContactsScreen() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { user } = useAuth();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch contacts from your backend
      // const fetchedContacts = await contactsService.getContacts(user?.uid);
      // setContacts(fetchedContacts);
      
      // Temporary mock data
      setContacts([
        {
          id: '1',
          name: 'John Doe',
          phoneNumber: '+1234567890',
          relationship: 'Family',
          isPrimary: true,
        },
        {
          id: '2',
          name: 'Jane Smith',
          phoneNumber: '+0987654321',
          relationship: 'Friend',
          isPrimary: false,
        },
      ]);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load emergency contacts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to delete this emergency contact?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // await contactsService.deleteContact(user?.uid, contactId);
              setContacts(contacts.filter(contact => contact.id !== contactId));
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete emergency contact.');
            }
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (contactId: string) => {
    try {
      // await contactsService.setPrimaryContact(user?.uid, contactId);
      setContacts(contacts.map(contact => ({
        ...contact,
        isPrimary: contact.id === contactId,
      })));
    } catch (error) {
      console.error('Error setting primary contact:', error);
      Alert.alert('Error', 'Failed to set primary contact.');
    }
  };

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
        <Text style={styles.contactRelationship}>{item.relationship}</Text>
      </View>
      <View style={styles.contactActions}>
        {!item.isPrimary && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetPrimary(item.id)}
          >
            <MaterialIcons name="star-border" size={24} color="#FF4B4B" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteContact(item.id)}
        >
          <MaterialIcons name="delete" size={24} color="#FF4B4B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contacts</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4B4B" />
        </View>
      ) : (
        <FlatList
          data={contacts}
          renderItem={renderContact}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people" size={48} color="#CCCCCC" />
              <Text style={styles.emptyText}>No emergency contacts</Text>
              <Text style={styles.emptySubtext}>
                Add contacts to notify in case of emergency
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddContact' as never)}
      >
        <MaterialIcons name="add" size={24} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Add Contact</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF4B4B',
    padding: 24,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  contactRelationship: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4B4B',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 