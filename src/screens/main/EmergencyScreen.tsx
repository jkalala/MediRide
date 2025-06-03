import React from 'react';
import { View, StyleSheet } from 'react-native';
import EmergencyDispatch from '../../components/EmergencyDispatch';

export default function EmergencyScreen() {
  const handleDispatchComplete = (success: boolean) => {
    // Handle dispatch completion if needed
    console.log('Dispatch completed:', success);
  };

  return (
    <View style={styles.container}>
      <EmergencyDispatch onDispatchComplete={handleDispatchComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
}); 