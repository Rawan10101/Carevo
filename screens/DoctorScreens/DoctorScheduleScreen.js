import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Alert,
  Platform 
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { firestore, auth } from '../../firebaseConfig';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';  // ✅ ADD setDoc

export default function DoctorScheduleScreen() {
  const [slots, setSlots] = useState([]);
  const [newSlotDate, setNewSlotDate] = useState(new Date());
  const [newSlotTime, setNewSlotTime] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorId = auth.currentUser.uid;
    const doctorRef = doc(firestore, 'Doctors', doctorId);
    
    const unsubscribe = onSnapshot(doctorRef, async (docSnap) => {
      if (!docSnap.exists()) {
        // AUTO-CREATE Doctors document if missing
        try {
          await setDoc(doctorRef, {
            name: 'Doctor',  // Will be updated from users collection
            specialty: 'General',
            Slots: [],
            ratings: [],
            averageRating: 0
          });
          setSlots([]);
        } catch (error) {
          console.error('Failed to create doctor document:', error);
        }
      } else {
        setSlots(docSnap.data().Slots || []);
      }
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).replace(/\//g, '-');
  };

  const formatTimeDisplay = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    });
  };

  const formatTime = (timestamp) => timestamp ? timestamp.toDate().toLocaleString() : 'N/A';

  const handleConfirmDate = (date) => {
    setNewSlotDate(date);
    setDatePickerVisible(false);
  };

  const handleConfirmTime = (time) => {
    setNewSlotTime(time);
    setTimePickerVisible(false);
  };

  const addSlot = async () => {
    try {
      const doctorId = auth.currentUser.uid;
      const doctorRef = doc(firestore, 'Doctors', doctorId);
      
      const slotDateTime = new Date(newSlotDate);
      slotDateTime.setHours(newSlotTime.getHours(), newSlotTime.getMinutes());
      
      const newSlot = {
        time: slotDateTime,
        isBooked: false,
        patientId: '',
        patientEmail: '',
        appointmentId: ''
      };

      // TRY UPDATE FIRST, FALLBACK TO SET
      try {
        const updatedSlots = [...slots, newSlot];
        await updateDoc(doctorRef, { Slots: updatedSlots });
      } catch (updateError) {
        // IF NO DOCUMENT, CREATE IT
        if (updateError.code === 'not-found') {
          await setDoc(doctorRef, {
            name: 'Doctor',
            specialty: 'General',
            Slots: [newSlot],
            ratings: [],
            averageRating: 0
          });
        } else {
          throw updateError;
        }
      }

      Alert.alert(' Success', `Slot added: ${formatDate(newSlotDate)} ${formatTimeDisplay(newSlotTime)}`);
      setNewSlotDate(new Date());
      setNewSlotTime(new Date());
    } catch (error) {
      Alert.alert(' Error', error.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Loading Schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Available Slots</Text>
      
      <View style={styles.addSlotSection}>
        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={() => setDatePickerVisible(true)}
        >
          <Text style={styles.pickerText}> {formatDate(newSlotDate)}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.pickerButton} 
          onPress={() => setTimePickerVisible(true)}
        >
          <Text style={styles.pickerText}>{formatTimeDisplay(newSlotTime)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.addButton} onPress={addSlot}>
          <Text style={styles.addButtonText}>➕ Add Slot</Text>
        </TouchableOpacity>
      </View>

      {/* CALENDAR MODAL */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisible(false)}
        date={newSlotDate}
        display="inline"
        maximumDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
      />

      {/* TIME MODAL */}
      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerVisible(false)}
        date={newSlotTime}
        display="clock"
        is24Hour={true}
      />

      <Text style={styles.subtitle}>Available Slots ({slots.filter(s => !s.isBooked).length})</Text>
      
      <FlatList
        data={slots.filter(slot => !slot.isBooked)}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.slotCard}>
            <Text style={styles.slotTime}>{formatTime(item.time)}</Text>
            <Text style={styles.availableStatus}> Available</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No available slots</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#28813fff', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
  addSlotSection: { 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 12, 
    marginBottom: 20, 
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerButton: { 
    backgroundColor: '#f0f8ff', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 15, 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#28813fff',
    shadowColor: '#28813fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#28813fff',
    letterSpacing: 0.5,
  },
  addButton: { 
    backgroundColor: '#28813fff', 
    padding: 18, 
    borderRadius: 12, 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  addButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  slotCard: { 
    backgroundColor: 'white', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  slotTime: { fontSize: 16, fontWeight: '600', flex: 1, color: '#333' },
  availableStatus: { 
    color: '#28a745', 
    fontWeight: 'bold', 
    fontSize: 14,
    backgroundColor: '#d4edda',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#666', 
    fontStyle: 'italic', 
    padding: 40,
    fontSize: 16,
  },
});
