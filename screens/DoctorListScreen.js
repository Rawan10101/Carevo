import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { firestore, auth } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  updateDoc,
  query, 
  where, 
  documentId,
  Timestamp 
} from 'firebase/firestore';

const DoctorListScreen = ({ route, navigation }) => {
  const { clinicId, clinicName, doctorIds } = route.params || {}; 
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  // State to track which doctor's card is currently expanded
  const [expandedDoctorId, setExpandedDoctorId] = useState(null); 

  // Get current user
  const currentUser = auth.currentUser;

  // Helper function to format Firestore Timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return { date: 'N/A', time: 'N/A' };
    
    try {
      // Convert Firestore Timestamp to JavaScript Date
      const date = timestamp.toDate();
      
      // Format date (e.g., "15/11/2025")
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      
      // Format time (e.g., "12:00 PM")
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const formattedTime = `${displayHours}:${minutes} ${ampm}`;
      
      return {
        date: formattedDate,
        time: formattedTime,
        fullDate: date,
        timestamp: timestamp
      };
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  // Function to handle appointment booking
  const handleBookAppointment = (doctorId, doctorName, slot, slotIndex) => {
    if (!currentUser) {
      Alert.alert('Not Logged In', 'Please log in to book an appointment.');
      return;
    }

    const formatted = formatTimestamp(slot.time);

    Alert.alert(
      'Confirm Appointment',
      `Book with ${doctorName}\nDate: ${formatted.date}\nTime: ${formatted.time}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => bookAppointment(doctorId, doctorName, slot, slotIndex),
        },
      ],
      { cancelable: true }
    );
  };

  // Function to book the appointment and update Firestore
  const bookAppointment = async (doctorId, doctorName, slot, slotIndex) => {
    if (bookingInProgress) return; // Prevent multiple clicks
    
    setBookingInProgress(true);

    try {
      // Get the doctor document reference
      const doctorRef = doc(firestore, 'Doctors', doctorId);
      const doctorSnapshot = await getDoc(doctorRef);

      if (!doctorSnapshot.exists()) {
        Alert.alert('Error', 'Doctor not found.');
        setBookingInProgress(false);
        return;
      }

      const doctorData = doctorSnapshot.data();
      const slots = doctorData.Slots || doctorData.slots || [];

      // Find the slot by comparing timestamps
      const slotToBook = slots.find(s => {
        if (s.time && slot.time) {
          // Compare timestamps using seconds and nanoseconds
          return s.time.seconds === slot.time.seconds && 
                 s.time.nanoseconds === slot.time.nanoseconds;
        }
        return false;
      });
      
      if (!slotToBook) {
        Alert.alert('Error', 'Slot not found.');
        setBookingInProgress(false);
        return;
      }

      if (slotToBook.isBooked) {
        Alert.alert('Already Booked', 'This slot has already been booked by another patient.');
        setBookingInProgress(false);
        // Refresh the doctors list
        fetchDoctorsByIds();
        return;
      }

      // Update the slot to mark it as booked
      const updatedSlots = slots.map(s => {
        if (s.time && slot.time && 
            s.time.seconds === slot.time.seconds && 
            s.time.nanoseconds === slot.time.nanoseconds) {
          return {
            ...s,
            isBooked: true,
            patientId: currentUser.uid,
            patientEmail: currentUser.email || 'N/A',
            bookedAt: Timestamp.now(),
          };
        }
        return s;
      });

      // Update Firestore
      await updateDoc(doctorRef, {
        Slots: updatedSlots,
      });

      // Update local state
      setDoctors(prevDoctors => 
        prevDoctors.map(doctor => {
          if (doctor.id === doctorId) {
            return {
              ...doctor,
              Slots: updatedSlots,
            };
          }
          return doctor;
        })
      );

      const formatted = formatTimestamp(slot.time);
      
      // Show success message
      Alert.alert(
        'Success!',
        `Your appointment with ${doctorName} has been booked for ${formatted.date} at ${formatted.time}.`,
        [{ text: 'OK' }]
      );

      setBookingInProgress(false);

    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
      setBookingInProgress(false);
    }
  };

  // Function to change the expanded state
  const toggleExpansion = (doctorId) => {
    setExpandedDoctorId(doctorId === expandedDoctorId ? null : doctorId);
  };

  // Set the screen title
  useEffect(() => {
    if (clinicName) {
      navigation.setOptions({ title: clinicName });
    }
  }, [clinicName, navigation]);

  useEffect(() => {
    if (!doctorIds || doctorIds.length === 0) {
      setIsLoading(false);
      setDoctors([]);
      return; 
    }

    setIsLoading(true);
    fetchDoctorsByIds();
  }, [doctorIds]);

  // Fetch doctors from Firestore based on the doctor IDs
  const fetchDoctorsByIds = async () => {
    try {
      const maxBatchSize = 10; // Firestore 'in' query limit
      const batches = [];
      
      // Split doctor IDs into batches of 10
      for (let i = 0; i < doctorIds.length; i += maxBatchSize) {
        const batch = doctorIds.slice(i, i + maxBatchSize);
        
        // Query for doctors with IDs in this batch
        const doctorsQuery = query(
          collection(firestore, 'Doctors'),
          where(documentId(), 'in', batch)
        );
        
        batches.push(getDocs(doctorsQuery));
      }

      // Execute all batch queries
      const snapshots = await Promise.all(batches);
      let doctorsList = [];

      snapshots.forEach(querySnapshot => {
        querySnapshot.docs.forEach(docSnapshot => {
          const data = docSnapshot.data();
          
          console.log('Doctor data:', docSnapshot.id, data); // Debug log
          
          // Handle field names with and without trailing spaces
          const doctorName = data.name || data['name '] || data.Name || data['Name '] || 'Unknown Doctor';
          const specialty = data.specialty || data['specialty '] || data.Specialty || data['Specialty '] || 'N/A';
          const experience = data.experience || data['experience '] || data.Experience || data['Experience '] || 'N/A';
          const education = data.education || data['education '] || data.Education || data['Education '] || 'N/A';
          const phone = data.phone || data['phone '] || data.Phone || data['Phone '] || 'N/A';
          const slots = data.Slots || data['Slots '] || data.slots || data['slots '] || [];
          
          // Handle both field name cases and ensure compatibility
          doctorsList.push({
            id: docSnapshot.id,
            name: doctorName.trim ? doctorName.trim() : doctorName,
            specialty: specialty.trim ? specialty.trim() : specialty,
            experience: experience.trim ? experience.trim() : experience,
            education: education.trim ? education.trim() : education,
            phone: phone.trim ? phone.trim() : phone,
            Slots: slots,
          });
        });
      });
      
      // Sort by name
      doctorsList.sort((a, b) => {
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      });

      setDoctors(doctorsList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setIsLoading(false);
    }
  };
  
  // Custom view for when the list is loading
  const LoadingView = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2b8a3e" /> 
      <Text style={styles.loadingText}>Loading Doctors...</Text>
    </View>
  );

  const renderDoctorItem = ({ item }) => {
    const isExpanded = item.id === expandedDoctorId;
    
    const availableSlots = item.Slots 
        ? item.Slots.filter(slot => slot.isBooked === false)
        : [];

    const bookedSlots = item.Slots 
        ? item.Slots.filter(slot => slot.isBooked === true)
        : [];

    return (
      <View style={styles.doctorCard}>
        <TouchableOpacity 
          onPress={() => toggleExpansion(item.id)} 
          activeOpacity={0.8}
        >
          {/* Doctor Header */}
          <View style={styles.doctorHeader}>
            <View style={styles.doctorAvatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{item.name}</Text>
              <Text style={styles.doctorSpecialty}>{item.specialty}</Text>
              {item.experience !== 'N/A' && (
                <Text style={styles.doctorExperience}>
                  {item.experience} years experience
                </Text>
              )}
            </View>
            <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
          </View>
        </TouchableOpacity>

        {/* Expanded Details */}
        {isExpanded && (
          <View style={styles.expandedSection}>
            {/* Doctor Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Doctor Information</Text>
              
              {item.education !== 'N/A' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Education:</Text>
                  <Text style={styles.detailValue}>{item.education}</Text>
                </View>
              )}
              
              {item.phone !== 'N/A' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone:</Text>
                  <Text style={styles.detailValue}>{item.phone}</Text>
                </View>
              )}
            </View>

            {/* Available Slots */}
            <View style={styles.slotsSection}>
              <Text style={styles.sectionTitle}>
                Available Appointments ({availableSlots.length})
              </Text>
              
              {availableSlots.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.slotsScroll}
                >
                  {availableSlots.map((slot, index) => {
                    const formatted = formatTimestamp(slot.time);

                    return (
                      <TouchableOpacity 
                        key={index} 
                        style={styles.slotCard}
                        onPress={() => handleBookAppointment(item.id, item.name, slot, index)}
                        activeOpacity={0.7}
                        disabled={bookingInProgress}
                      > 
                        <Text style={styles.slotDate}>{formatted.date}</Text>
                        <Text style={styles.slotTime}>{formatted.time}</Text>
                        <View style={styles.bookButton}>
                          <Text style={styles.bookButtonText}>Book</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : (
                <Text style={styles.noSlotsText}>No appointments available</Text>
              )}
            </View>

            {/* Booked Slots Info */}
            {bookedSlots.length > 0 && (
              <View style={styles.bookedInfo}>
                <Text style={styles.bookedInfoText}>
                  {bookedSlots.length} slot{bookedSlots.length > 1 ? 's' : ''} already booked
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <View style={styles.container}>
      {doctors.length === 0 ? (
        <Text style={styles.noDataText}>
          No doctors found for {clinicName || 'this clinic'}.
        </Text>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={item => item.id}
          renderItem={renderDoctorItem}
          contentContainerStyle={styles.listContentPadding} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    paddingHorizontal: 10,
  },
  
  // Doctor Card Styles
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2b8a3e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  doctorInfo: {
    flex: 1,
  },
  
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  doctorSpecialty: {
    fontSize: 14,
    color: '#2b8a3e',
    fontWeight: '600',
    marginBottom: 2,
  },
  
  doctorExperience: {
    fontSize: 12,
    color: '#666',
  },
  
  expandIcon: {
    fontSize: 16,
    color: '#999',
    marginLeft: 8,
  },
  
  // Expanded Section
  expandedSection: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    padding: 16,
    paddingTop: 12,
  },
  
  detailsSection: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    width: 100,
  },
  
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  
  // Slots Section
  slotsSection: {
    marginBottom: 12,
  },
  
  slotsScroll: {
    marginTop: 8,
  },
  
  slotCard: {
    backgroundColor: '#e6f7e9',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2b8a3e',
  },
  
  slotDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b8a3e',
    marginBottom: 4,
  },
  
  slotTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2b8a3e',
    marginBottom: 8,
  },
  
  bookButton: {
    backgroundColor: '#2b8a3e',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 5,
  },
  
  bookButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  
  noSlotsText: {
    fontSize: 14,
    color: '#D32F2F',
    marginTop: 5,
    fontStyle: 'italic',
  },
  
  bookedInfo: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  
  bookedInfoText: {
    fontSize: 13,
    color: '#856404',
    textAlign: 'center',
  },
  
  // Base Styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f4f8',
  },
  
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: 'gray',
  },
  
  noDataText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: 'gray',
  },
  
  listContentPadding: {
    paddingTop: 10,
    paddingBottom: 20,
  },
});

export default DoctorListScreen;
