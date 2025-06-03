import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MainTabParamList, EmergencyStackParamList } from './types';
import HomeScreen from '../screens/main/HomeScreen';
import EmergencyScreen from '../screens/main/EmergencyScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import EmergencyContactsScreen from '../screens/emergency/EmergencyContactsScreen';
import AddContactScreen from '../screens/emergency/AddContactScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator();
const EmergencyStack = createStackNavigator();

const EmergencyStackNavigator = () => (
  <EmergencyStack.Navigator screenOptions={{ headerShown: false }}>
    <EmergencyStack.Screen name="EmergencyMain" component={EmergencyScreen} />
    <EmergencyStack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
    <EmergencyStack.Screen name="AddContact" component={AddContactScreen} />
  </EmergencyStack.Navigator>
);

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: keyof MainTabParamList } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Emergency':
              iconName = focused ? 'ambulance' : 'ambulance';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            case 'Settings':
              iconName = focused ? 'cog' : 'cog-outline';
              break;
            default:
              iconName = 'help-circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF4B4B',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Emergency" component={EmergencyStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
} 