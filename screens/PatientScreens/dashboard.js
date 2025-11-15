import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Dashboard = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header with only app name */}
      {/* <Text style={styles.title}>Carevo</Text> */}

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Clinics')}
      >
        <Text style={styles.cardTitle}>Clinics</Text>
        <Text style={styles.cardSubtitle}>Manage clinics and departments</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Appointments')}
      >
        <Text style={styles.cardTitle}>Appointments</Text>
        <Text style={styles.cardSubtitle}>View and schedule appointments</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
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
    paddingHorizontal: 24,
    paddingVertical: 30,
    backgroundColor: '#f9fafc',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 36,
    color: '#1f2a44',
  },
  card: {
    width: '90%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#28813fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#28813fff',
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#545c64ff',
    textAlign: 'center',
  },
});

export default Dashboard;
