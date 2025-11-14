// File: ./screens/PatientScreens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView } from 'react-native';
import { auth, firestore } from '../../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(firestore, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log('No user data found');
        }
      } catch (err) {
        console.log('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.log('Error logging out:', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2b8a3e" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text>No profile data available.</Text>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.field}>
        <Text style={styles.label}>User Name:</Text>
        <Text style={styles.value}>{userData['User-Name']}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number:</Text>
        <Text style={styles.value}>{userData.PhoneNumber}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Age:</Text>
        <Text style={styles.value}>{userData.Age}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Gender:</Text>
        <Text style={styles.value}>{userData.Gender}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Account Created:</Text>
        <Text style={styles.value}>
          {userData.createdAt?.toDate
            ? userData.createdAt.toDate().toLocaleString()
            : ''}
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="Logout" onPress={handleLogout} color="#d9534f" />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f2f4f8',
    alignItems: 'flex-start',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',
    marginTop: 20,
  },
  field: { marginBottom: 15 },
  label: { fontSize: 16, fontWeight: '600', color: '#333' },
  value: { fontSize: 16, color: '#555', marginTop: 2 },
});

export default ProfileScreen;
