import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import {
  auth,
  firestore,
  collection,
  query,
  where,
  getDocs,
  doc,       
  updateDoc,
  orderBy
} from '../../firebaseConfig';


export default function ViewAppointmentsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const appointmentsRef = collection(firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('userId', '==', auth.currentUser.uid)
      );

      const snapshot = await getDocs(q);
      const appointmentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAppointments(appointmentsList);
    } catch (error) {
      Alert.alert('Error', 'Failed to load appointments');
    }
    setLoading(false);
  };

  const renderAppointment = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.clinicText}>Clinic ID: {item.clinicId}</Text>
      <Text style={styles.doctorText}>Doctor ID: {item.doctorId}</Text>
      <Text style={styles.dateText}>Date: {item.date}</Text>
      <Text style={styles.slotText}>Time: {item.timeSlot}</Text>
      <Text style={[
        styles.statusText,
        { color: item.status === 'confirmed' ? 'green' : 'orange' }
      ]}>
        Status: {item.status.toUpperCase()}
      </Text>
      {item.notes && <Text style={styles.notesText}>Notes: {item.notes}</Text>}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.rescheduleButton}
          onPress={() => navigation.navigate('RescheduleAppointment', { appointmentId: item.id })}
        >
          <Text style={styles.buttonText}>Reschedule</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelAppointment(item.id)}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleCancelAppointment = (appointmentId) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
            // Get reference to the appointment document
            const appointmentRef = doc(firestore, 'appointments', appointmentId);
            
            // Update the status field to 'cancelled'
            await updateDoc(appointmentRef, {
              status: 'cancelled'
            });
            
            // Show success message
            Alert.alert('Success', 'Appointment cancelled successfully');
            
            // Refresh the appointments list
            fetchAppointments();
          } catch (error) {
            Alert.alert('Error', 'Failed to cancel appointment: ' + error.message);
          }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#097ae6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No appointments found</Text>
        }
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  appointmentCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  clinicText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5
  },
  doctorText: {
    fontSize: 14,
    marginBottom: 5
  },
  dateText: {
    fontSize: 14,
    marginBottom: 5
  },
  slotText: {
    fontSize: 14,
    marginBottom: 5
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5
  },
  notesText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10
  },
  rescheduleButton: {
    backgroundColor: '#097ae6',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999'
  }
});
