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
  updateDoc,
  getDoc, // when canelling or rescheduling an appointment
  //arrayRemove,
  onSnapshot
} from 'firebase/firestore';

export default function AppointmentsScreen({ navigation }) {
  const [filter, setFilter] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // FORMAT DATE
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

  // REAL-TIME FIRESTORE LISTENER
  useEffect(() => {
    const currentUserId = auth.currentUser?.uid;
    if (!currentUserId) return;

    const userRef = doc(firestore, 'users', currentUserId);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (!snapshot.exists()) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      const userData = snapshot.data();
      const userAppointments = userData.Appointments || [];

      const categorizedAppointments = userAppointments.map((apt) => {
        let status = apt.status || 'confirmed';

        // Check if in past
        try {
          if (status === 'confirmed' && apt.slotTime?.toDate() < new Date()) {
            status = 'past';
          }
        } catch {}

        return {
          ...apt,
          displayStatus: status === 'confirmed' ? 'upcoming' : status
        };
      });

      // Sort by newest first
      categorizedAppointments.sort((a, b) => {
        if (a.slotTime && b.slotTime) {
          return b.slotTime.seconds - a.slotTime.seconds;
        }
        return 0;
      });

      setAppointments(categorizedAppointments);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // CANCEL APPOINTMENT
  // ======================================================
const handleCancelAppointment = (appointment) => {
  Alert.alert(
    'Cancel Appointment',
    `Cancel appointment with ${appointment.doctorName}?`,
    [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            const currentUserId = auth.currentUser.uid;
            
            // Free doctor slot
            const doctorRef = doc(firestore, 'Doctors', appointment.doctorId);
            const doctorSnap = await getDoc(doctorRef);
            
            if (doctorSnap.exists()) {
              const updatedSlots = doctorSnap.data().Slots.map(slot => 
                (slot.time?.seconds === appointment.slotTime.seconds &&
                 slot.time?.nanoseconds === appointment.slotTime.nanoseconds)
                  ? { time: slot.time, isBooked: false, patientId: "", patientEmail: "", appointmentId: "" }
                  : slot
              );
              await updateDoc(doctorRef, { Slots: updatedSlots });
            }

            // Cancel in user appointments using appointmentId
            const userRef = doc(firestore, 'users', currentUserId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const appointments = userSnap.data().Appointments || [];
              
              // Use appointmentId if available, otherwise fall back to timestamp matching
              const updatedAppointments = appointments.map(apt => {
                // Try matching by appointmentId first
                if (apt.appointmentId && appointment.appointmentId && 
                    apt.appointmentId === appointment.appointmentId) {
                  return { ...apt, status: 'cancelled' };
                }
                
                // Fall back to timestamp matching
                if (apt.doctorId === appointment.doctorId &&
                    apt.slotTime?.seconds === appointment.slotTime?.seconds &&
                    apt.slotTime?.nanoseconds === appointment.slotTime?.nanoseconds) {
                  return { ...apt, status: 'cancelled' };
                }
                
                return apt;
              });

              await updateDoc(userRef, { Appointments: updatedAppointments });
              Alert.alert('Success', 'Appointment cancelled');
            } else {
              Alert.alert('Error', 'User not found');
            }
            
          } catch (error) {
            console.error('Cancel error:', error);
            Alert.alert('Error', error.message);
          }
        }
      }
    ]
  );
};



  // FILTERED LIST
  const filteredAppointments = appointments.filter(apt => 
    apt.displayStatus === filter
  );

// ======================================================
// RESCHEDULE APPOINTMENT
// ======================================================
const handleReschedule = (appointment) => {
  Alert.alert(
    'Reschedule Appointment',
    `Reschedule appointment with ${appointment.doctorName}?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Continue',
        onPress: () => {
          navigation.navigate('Clinics', { 
            rescheduleData: appointment 
          });
        }
      }
    ]
  );
};

  // RENDER ITEM
  const renderItem = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.clinicText}>{item.clinicName}</Text>
      <Text style={styles.doctorText}>Doctor: {item.doctorName}</Text>
      <Text style={styles.dateText}>Date: {formatTimestamp(item.slotTime)}</Text>

      <Text style={[
        styles.statusText,
        { color: item.displayStatus === "upcoming" ? "#2b8a3e" : item.displayStatus === "past" ? "#555" : "#d9534f" }
      ]}>
        Status: {item.displayStatus.toUpperCase()}
      </Text>

      {item.displayStatus === 'upcoming' && (
        <View style={styles.buttonsRow}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#d9534f' }]}
            onPress={() => handleCancelAppointment(item)} // <-- UNCOMMENTED THIS
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, { backgroundColor: '#2b8a3e' }]}
            onPress={() => handleReschedule(item)}

          >
            <Text style={styles.buttonText}>Reschedule</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // UI
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

      <View style={styles.tabsWrapper}>
        <View style={styles.filterRow}>
          {['upcoming', 'past', 'cancelled'].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterButton, filter === f && styles.activeFilter]}
              onPress={() => setFilter(f)}
            >
              <Text style={{ 
                color: filter === f ? 'white' : 'black', 
                fontWeight: 'bold' 
              }}>
                {f.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredAppointments}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 20, color: '#999' }}>
            No {filter} appointments
          </Text>
        }
      />

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
    marginBottom: 10,
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
  appointmentCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  clinicText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b8a3e',
    marginBottom: 5,
  },
  doctorText: {
    fontSize: 14,
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
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
