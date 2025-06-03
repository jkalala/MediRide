import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '../screens/HomeScreen';
import { EmergencyScreen } from '../screens/EmergencyScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { EmergencyContactsScreen } from '../screens/EmergencyContactsScreen';
import { AddContactScreen } from '../screens/AddContactScreen';

type RootStackParamList = {
  Home: undefined;
  Emergency: undefined;
  Profile: undefined;
  Settings: undefined;
  EmergencyMain: undefined;
  EmergencyContacts: undefined;
  AddContact: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const EmergencyStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="EmergencyMain" component={EmergencyScreen} />
    <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
    <Stack.Screen name="AddContact" component={AddContactScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof RootStackParamList } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Emergency':
              iconName = 'local-hospital';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'Settings':
              iconName = 'settings';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF4B4B',
        tabBarInactiveTintColor: '#999999',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Emergency" component={EmergencyStack} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}; 