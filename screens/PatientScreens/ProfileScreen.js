// File: ./screens/PatientScreens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { auth } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';

const ProfileScreen = ({ navigation }) => {

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); 
    } catch (error) {
      console.log('Error logging out:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Welcome to your profile!</Text>

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
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
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7a8f',
    textAlign: 'center',
  },
});

export default ProfileScreen;
