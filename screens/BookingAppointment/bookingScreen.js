import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import {
  auth,
  firestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp
} from '../../firebaseConfig';

export default function bookingScreen({ navigation }) {
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock data for clinics (since you mentioned you'll mock this)
  useEffect(() => {
    const mockClinics = [
      { id: '1', name: 'Cardiology Clinic' },
      { id: '2', name: 'Orthopedics Clinic' },
      { id: '3', name: 'Pediatrics Clinic' }
    ];
    setClinics(mockClinics);
  }, []);

  // Mock available time slots
  const mockTimeSlots = [
    '09:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00'
  ];

  // When clinic is selected, load doctors (mocked for now)
  useEffect(() => {
    if (selectedClinic) {
      const mockDoctors = [
        { id: 'd1', name: 'Dr. Ahmed Hassan', clinicId: selectedClinic },
        { id: 'd2', name: 'Dr. Sara Mohamed', clinicId: selectedClinic }
      ];
      setDoctors(mockDoctors);
    }
  }, [selectedClinic]);

  // Check available slots for selected date
  const checkAvailableSlots = async () => {
    if (!selectedDate || !selectedDoctor) return;

    setLoading(true);
    try {
      // Query existing appointments for the selected date and doctor
      const appointmentsRef = collection(firestore, 'appointments');
      const q = query(
        appointmentsRef,
        where('doctorId', '==', selectedDoctor),
        where('date', '==', selectedDate),
        where('status', '!=', 'cancelled')
      );

      const snapshot = await getDocs(q);
      const bookedSlots = snapshot.docs.map(doc => doc.data().timeSlot);

      // Filter out booked slots
      const available = mockTimeSlots.filter(slot => !bookedSlots.includes(slot));
      setAvailableSlots(available);
    } catch (error) {
      Alert.alert('Error', 'Failed to check availability');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedDate && selectedDoctor) {
      checkAvailableSlots();
    }
  }, [selectedDate, selectedDoctor]);

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!selectedClinic || !selectedDoctor || !selectedDate || !selectedSlot) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const appointmentsRef = collection(firestore, 'appointments');
      
      await addDoc(appointmentsRef, {
        userId: auth.currentUser.uid,
        clinicId: selectedClinic,
        doctorId: selectedDoctor,
        date: selectedDate,
        timeSlot: selectedSlot,
        status: 'pending',
        notes: notes,
        createdAt: serverTimestamp()
      });

      Alert.alert(
        'Success',
        'Appointment booked successfully! Pending confirmation.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>

      {/* Clinic Selection */}
      <Text style={styles.label}>Select Clinic:</Text>
      <View style={styles.optionsContainer}>
        {clinics.map(clinic => (
          <TouchableOpacity
            key={clinic.id}
            style={[
              styles.optionButton,
              selectedClinic === clinic.id && styles.selectedOption
            ]}
            onPress={() => setSelectedClinic(clinic.id)}
          >
            <Text style={styles.optionText}>{clinic.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Doctor Selection */}
      {selectedClinic && (
        <>
          <Text style={styles.label}>Select Doctor:</Text>
          <View style={styles.optionsContainer}>
            {doctors.map(doctor => (
              <TouchableOpacity
                key={doctor.id}
                style={[
                  styles.optionButton,
                  selectedDoctor === doctor.id && styles.selectedOption
                ]}
                onPress={() => setSelectedDoctor(doctor.id)}
              >
                <Text style={styles.optionText}>{doctor.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Date Input */}
      {selectedDoctor && (
        <>
          <Text style={styles.label}>Select Date (YYYY-MM-DD):</Text>
          <TextInput
            style={styles.input}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="2025-11-20"
          />
        </>
      )}

      {/* Available Time Slots */}
      {availableSlots.length > 0 && (
        <>
          <Text style={styles.label}>Available Time Slots:</Text>
          <View style={styles.optionsContainer}>
            {availableSlots.map(slot => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.optionButton,
                  selectedSlot === slot && styles.selectedOption
                ]}
                onPress={() => setSelectedSlot(slot)}
              >
                <Text style={styles.optionText}>{slot}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Notes */}
      {selectedSlot && (
        <>
          <Text style={styles.label}>Additional Notes (Optional):</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any specific concerns or information..."
            multiline
            numberOfLines={4}
          />
        </>
      )}

      {/* Confirm Button */}
      {selectedSlot && (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 10
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  optionButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f5f5f5'
  },
  selectedOption: {
    backgroundColor: '#097ae6',
    borderColor: '#097ae6'
  },
  optionText: {
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top'
  },
  confirmButton: {
    backgroundColor: '#2b8a3e',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center'
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
