// File: ./screens/PatientScreens/appointScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AppointmentsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Appointments Screen</Text>
      <Text style={styles.subtitle}>
        View and manage your appointments here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#f2f4f8',
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7a8f',
    textAlign: 'center',
  },
});

export default AppointmentsScreen;
