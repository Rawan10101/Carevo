// In RescheduleAppointmentScreen.js
import { doc, updateDoc } from '../../firebaseConfig';

const handleReschedule = async (appointmentId, newDate, newSlot) => {
  try {
    const appointmentRef = doc(firestore, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      date: newDate,
      timeSlot: newSlot,
      status: 'pending' // Reset to pending after reschedule
    });
    Alert.alert('Success', 'Appointment rescheduled successfully');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

// Cancel appointment
const handleCancelAppointment = async (appointmentId) => {
  try {
    const appointmentRef = doc(firestore, 'appointments', appointmentId);
    await updateDoc(appointmentRef, {
      status: 'cancelled'
    });
    Alert.alert('Success', 'Appointment cancelled');
    fetchAppointments(); // Refresh list
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
