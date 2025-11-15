import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { firestore, auth } from '../../firebaseConfig';
import { 
  doc, 
  getDoc, 
  updateDoc,
  arrayRemove,
  Timestamp 
} from 'firebase/firestore';

export default function AppointmentsScreen({ navigation }) {
  const [filter, setFilter] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Format timestamp to readable date/time
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = timestamp.toDate();
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      
      return `${day}/${month}/${year} ${displayHours}:${minutes} ${ampm}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Check if appointment is in the past
  const isPastAppointment = (slotTime) => {
    if (!slotTime) return false;
    try {
      const appointmentDate = slotTime.toDate();
      const now = new Date();
      return appointmentDate < now;
    } catch (error) {
      return false;
    }
  };

  // Fetch appointments from user's document
  const fetchAppointments = async () => {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) {
        Alert.alert('Error', 'You must be logged in');
        setLoading(false);
        return;
      }

      // Get user document
      const userRef = doc(firestore, 'users', currentUserId);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        setLoading(false);
        return;
      }

      const userData = userSnapshot.data();
      const userAppointments = userData.Appointments || [];

      // Categorize appointments
      const categorizedAppointments = userAppointments.map(apt => {
        let status = apt.status || 'confirmed';
        
        // Check if appointment is in the past
        if (status === 'confirmed' && isPastAppointment(apt.slotTime)) {
          status = 'past';
        }
        
        return {
          ...apt,
          displayStatus: status === 'confirmed' ? 'upcoming' : status
        };
      });

      // Sort by slot time (most recent first)
      categorizedAppointments.sort((a, b) => {
        if (a.slotTime && b.slotTime) {
          return b.slotTime.seconds - a.slotTime.seconds;
        }
        return 0;
      });

      setAppointments(categorizedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    }
    setLoading(false);
  };

  // Cancel appointment
  const handleCancelAppointment = (appointment) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment with ${appointment.doctorName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const currentUserId = auth.currentUser.uid;
              
              // 1. Update Doctor's Slots to free up the slot
              const doctorRef = doc(firestore, 'Doctors', appointment.doctorId);
              const doctorSnapshot = await getDoc(doctorRef);

              if (doctorSnapshot.exists()) {
                const doctorData = doctorSnapshot.data();
                const slots = doctorData.Slots || [];

                const updatedSlots = slots.map(slot => {
                  if (slot.time && appointment.slotTime &&
                      slot.time.seconds === appointment.slotTime.seconds &&
                      slot.time.nanoseconds === appointment.slotTime.nanoseconds) {
                    return {
                      time: slot.time,
                      isBooked: false,
                    };
                  }
                  return slot;
                });

                await updateDoc(doctorRef, { Slots: updatedSlots });
              }

              // 2. Remove appointment from user's Appointments array
              const userRef = doc(firestore, 'users', currentUserId);
              await updateDoc(userRef, {
                Appointments: arrayRemove(appointment)
              });

              Alert.alert('Success', 'Appointment cancelled successfully');
              
              // Refresh appointments
              fetchAppointments();
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'upcoming') {
      return apt.displayStatus === 'upcoming';
    } else if (filter === 'past') {
      return apt.displayStatus === 'past';
    } else if (filter === 'cancelled') {
      return apt.displayStatus === 'cancelled';
    }
    return true;
  });

  const renderItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.clinicText}>{item.clinicName || 'Clinic'}</Text>
      <Text style={styles.doctorText}>Doctor: {item.doctorName || 'N/A'}</Text>
      <Text style={styles.dateText}>Date: {formatTimestamp(item.slotTime)}</Text>
      <Text style={[
        styles.statusText,
        { color: item.displayStatus === 'upcoming' ? '#2b8a3e' : item.displayStatus === 'past' ? '#666' : '#d9534f' }
      ]}>
        Status: {item.displayStatus.toUpperCase()}
      </Text>

      {item.displayStatus === 'upcoming' && (
        <View style={styles.buttonsRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#d9534f' }]}
            onPress={() => handleCancelAppointment(item)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2b8a3e" />
          <Text style={styles.loadingText}>Loading appointments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs Container with spacing from top */}
      <View style={styles.tabsWrapper}>
        <View style={styles.filterRow}>
          {['upcoming', 'past', 'cancelled'].map(f => (
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
          keyExtractor={(item) => item.appointmentId}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
              No {filter} appointments
            </Text>
          }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  tabsWrapper: {
    marginTop: 40,
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
    color: '#2b8a3e',
  },
  doctorText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  statusText: {
    fontSize: 14,
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
