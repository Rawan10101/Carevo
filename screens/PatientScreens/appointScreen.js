// File: ./screens/PatientScreens/appointScreen.js
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

export default function AppointmentsScreen({ navigation }) {
  const [filter, setFilter] = useState('upcoming'); // upcoming | past | cancelled

  const dummyAppointments = [   // just for testing will be removed when integrate with database 
    { id: '1', clinic: 'Clinic A', service: 'Dental', date: '2025-11-15 10:00', status: 'upcoming' },
    { id: '2', clinic: 'Clinic B', service: 'Cardiology', date: '2025-10-10 09:00', status: 'past' },
    { id: '3', clinic: 'Clinic C', service: 'Physiotherapy', date: '2025-09-01 11:30', status: 'cancelled' },
    { id: '4', clinic: 'Clinic D', service: 'Dermatology', date: '2025-11-20 14:00', status: 'upcoming' },
  ];

  const filteredAppointments = dummyAppointments.filter(a => a.status === filter);

  const renderItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.clinicText}>{item.clinic} - {item.service}</Text>
      <Text>Date: {item.date}</Text>
      <Text>Status: {item.status}</Text>
      {filter === 'upcoming' && (
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs Container with spacing from top */}
      <View style={styles.tabsWrapper}>
        <View style={styles.filterRow}>
          {['upcoming','past','cancelled'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.activeFilter]}
              onPress={() => setFilter(f)}
            >
              <Text style={{ color: filter === f ? 'white' : 'black', fontWeight: 'bold' }}>
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Appointments List */}
      <View style={styles.listContainer}>
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No {filter} appointments</Text>}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>

      {/* Book Appointment */}
      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate('Clinics')}
      >
        <Text style={styles.bookButtonText}>BOOK APPOINTMENT</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    paddingHorizontal: 10,
  },
  tabsWrapper: {
    marginTop: 40, // <- moves tabs down from top
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'gray',
  },
  activeFilter: {
    backgroundColor: '#2b8a3e',
  },
  listContainer: {
    flex: 1,
    marginBottom: 10,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  clinicText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#2b8a3e',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  bookButton: {
    backgroundColor: '#2b8a3e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  bookButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
