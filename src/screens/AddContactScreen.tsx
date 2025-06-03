import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { contactService, EmergencyContact } from '../services/contacts';
import { useNavigation } from '@react-navigation/native';

export const AddContactScreen: React.FC = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceContacts, setDeviceContacts] = useState<any[]>([]);
  const [showDeviceContacts, setShowDeviceContacts] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadDeviceContacts();
  }, []);

  const loadDeviceContacts = async () => {
    try {
      const contacts = await contactService.getDeviceContacts();
      setDeviceContacts(contacts);
    } catch (error) {
      console.error('Error loading device contacts:', error);
    }
  };

  const handleSave = async () => {
    if (!name || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name,
        phoneNumber,
        relationship,
        isPrimary: false,
      };

      await contactService.saveEmergencyContact(newContact);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDeviceContact = (contact: any) => {
    setName(contact.name || '');
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      setPhoneNumber(contact.phoneNumbers[0].number);
    }
    setShowDeviceContacts(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Emergency Contact</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity
          style={styles.deviceContactsButton}
          onPress={() => setShowDeviceContacts(!showDeviceContacts)}
        >
          <MaterialIcons name="contacts" size={24} color="#FF4B4B" />
          <Text style={styles.deviceContactsText}>Select from Contacts</Text>
        </TouchableOpacity>

        {showDeviceContacts && (
          <View style={styles.deviceContactsList}>
            {deviceContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.deviceContactItem}
                onPress={() => handleSelectDeviceContact(contact)}
              >
                <Text style={styles.deviceContactName}>{contact.name}</Text>
                {contact.phoneNumbers && contact.phoneNumbers.length > 0 && (
                  <Text style={styles.deviceContactPhone}>
                    {contact.phoneNumbers[0].number}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Relationship</Text>
            <TextInput
              style={styles.input}
              value={relationship}
              onChangeText={setRelationship}
              placeholder="Enter relationship"
              placeholderTextColor="#999999"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Save Contact</Text>
          )}
        </TouchableOpacity>
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
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  deviceContactsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  deviceContactsText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#FF4B4B',
    fontWeight: '500',
  },
  deviceContactsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    maxHeight: 200,
  },
  deviceContactItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  deviceContactName: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  deviceContactPhone: {
    fontSize: 14,
    color: '#666666',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#FF4B4B',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 