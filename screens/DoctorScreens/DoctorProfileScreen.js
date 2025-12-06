import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image
} from 'react-native';
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

  const handleAddMedicalHistory = () => {
    navigation.navigate('AddMedicalHistory');
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
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {userData['User-Name']?.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>{userData['User-Name']}</Text>
        <Text style={styles.email}>{userData.email}</Text>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Information</Text>

        {infoField("Phone Number", userData.PhoneNumber)}
        {infoField("Age", userData.Age)}
        {infoField("Gender", userData.Gender)}
        {infoField(
          "Account Created",
          userData.createdAt?.toDate
            ? userData.createdAt.toDate().toLocaleString()
            : ""
        )}
      </View>

      {/* Add Medical History */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddMedicalHistory}>
        <Text style={styles.addButtonText}>Add Medical History</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Helper to render fields cleaner
const infoField = (label, value) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f6f8fa',
    alignItems: 'center',
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 15,
  },

  avatar: {
    backgroundColor: '#2b8a3e',
    width: 95,
    height: 95,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },

  email: {
    fontSize: 15,
    color: '#555',
    marginTop: 3,
  },

  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    color: '#2b8a3e',
  },

  field: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  value: {
    fontSize: 15,
    color: '#666',
    marginTop: 3,
  },

  addButton: {
    backgroundColor: '#2b8a3e',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  logoutButton: {
    backgroundColor: '#d9534f',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },

  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
