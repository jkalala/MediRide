import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList } from '../../navigation/types';

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<MainTabParamList, 'Settings'>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          title: 'Notifications',
          icon: 'bell',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          title: 'Location Services',
          icon: 'map-marker',
          type: 'switch',
          value: locationServices,
          onValueChange: setLocationServices,
        },
        {
          title: 'Dark Mode',
          icon: 'theme-light-dark',
          type: 'switch',
          value: darkMode,
          onValueChange: setDarkMode,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          title: 'Privacy Policy',
          icon: 'shield-account',
          type: 'link',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon.'),
        },
        {
          title: 'Terms of Service',
          icon: 'file-document',
          type: 'link',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon.'),
        },
        {
          title: 'Help & Support',
          icon: 'help-circle',
          type: 'link',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon.'),
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Customize your app experience</Text>
      </View>

      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <View key={itemIndex} style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name={item.icon as any}
                  size={24}
                  color="#FF4B4B"
                />
                <Text style={styles.settingText}>{item.title}</Text>
              </View>
              {item.type === 'switch' ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{ false: '#767577', true: '#FF4B4B' }}
                  thumbColor={item.value ? '#fff' : '#f4f3f4'}
                />
              ) : (
                <TouchableOpacity onPress={item.onPress}>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ))}

      <View style={styles.section}>
        <Text style={styles.version}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#FF4B4B',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  version: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
}); 