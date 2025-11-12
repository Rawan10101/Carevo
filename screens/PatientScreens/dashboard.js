import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Dashboard = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carevo Dashboard</Text>
      
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Clinics')}
      >
        <Text style={styles.cardTitle}>Clinics</Text>
        <Text style={styles.cardSubtitle}>Manage clinics and departments</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Appointments')}
      >
        <Text style={styles.cardTitle}>Appointments</Text>
        <Text style={styles.cardSubtitle}>View and schedule appointments</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('MedicalRecords')}
      >
        <Text style={styles.cardTitle}>Medical Records</Text>
        <Text style={styles.cardSubtitle}>Access patient records</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f4f8',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 30,
    color: '#2a3a54',
  },
  card: {
    width: '90%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#344055',
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7a8f',
    textAlign: 'center',
  },
});

export default Dashboard;
