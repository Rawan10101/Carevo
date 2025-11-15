import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { firestore } from '../firebaseConfig';
import { 
  collection, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  documentId 
} from 'firebase/firestore';

const DoctorListScreen = ({ route, navigation }) => {
  const { clinicId, clinicName } = route.params || {}; 
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State to track which doctor's card is currently expanded
  const [expandedDoctorId, setExpandedDoctorId] = useState(null); 

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
    if (!clinicId) {
      setIsLoading(false);
      return; 
    }

    setIsLoading(true);

    const fetchDoctorsByClinic = async () => {
      try {
        // Fetch the Clinic Document to get the doctor IDs
        const clinicRef = doc(firestore, 'Clinics', clinicId);
        const clinicSnapshot = await getDoc(clinicRef);

        if (!clinicSnapshot.exists()) {
          console.warn(`Clinic with ID ${clinicId} not found.`);
          setDoctors([]);
          setIsLoading(false);
          return;
        }

        const doctorIds = clinicSnapshot.data().Doctors || []; 

        if (doctorIds.length === 0) {
          setDoctors([]);
          setIsLoading(false);
          return;
        }

        const maxBatchSize = 10;
        const batches = [];
        
        for (let i = 0; i < doctorIds.length; i += maxBatchSize) {
            const batch = doctorIds.slice(i, i + maxBatchSize);
            
            // Using the IDs to fetch the full Doctor Documents
            const doctorsQuery = query(
              collection(firestore, 'Doctors'),
              where(documentId(), 'in', batch)
            );
            
            batches.push(getDocs(doctorsQuery));
        }

        const snapshots = await Promise.all(batches);
        let doctorsList = [];

        snapshots.forEach(querySnapshot => {
            querySnapshot.docs.forEach(documentSnapshot => {
                doctorsList.push({
                    id: documentSnapshot.id,
                    ...documentSnapshot.data(),
                });
            });
        });
        
        // Sort by name after fetching all doctors
        doctorsList.sort((a, b) => {
          const nameA = a.name || '';
          const nameB = b.name || '';
          return nameA.localeCompare(nameB);
        });

        setDoctors(doctorsList);
        setIsLoading(false);

      } catch (error) {
        console.error("Firestore error fetching doctors by clinic ID:", error);
        setIsLoading(false);
      }
    };
    
    fetchDoctorsByClinic();
    
  }, [clinicId]);
  
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
        ? item.Slots.filter(slot => {
            return slot.isBooked === false; 
          })
        : [];

    return (
      <TouchableOpacity 
        style={styles.appointmentCard}
        onPress={() => toggleExpansion(item.id)} 
        activeOpacity={0.8}
      >
        <Text style={styles.clinicText}>{item.name}</Text> 
        <Text style={styles.specialtyText}>Specialty: {item.specialty || 'N/A'}</Text>
        
        {isExpanded && (
          <View style={styles.scheduleWrapper}>
            <Text style={styles.scheduleHeader}>Available Slots:</Text> 
            
            {availableSlots.length > 0 ? (
              <View style={styles.slotsContainer}>
                {availableSlots.map((slot, index) => {
                  
                  const parts = slot.time.split(' '); 
                  const dateString = parts[0];
                  const timeString = parts[1];
                  
                  // Format the date
                  const formattedDate = dateString.split('-').slice(1).join('/');

                  return (
                    <TouchableOpacity key={index} style={styles.slotPill}> 
                      <Text style={styles.slotText}>{formattedDate} @ {timeString}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noSlotsText}>No slots available.</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
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
  // CORE SCREEN STYLES
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
    paddingHorizontal: 10,
  },
  
  // CARD STYLE (Used for Doctor Item)
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
  
  // TEXT STYLES
  clinicText: { // Used for Doctor Name
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  
  // SCHEDULE/COLLAPSIBLE STYLES
  scheduleWrapper: {
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f2f4f8',
  },
  scheduleHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2b8a3e', 
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotPill: {
    backgroundColor: '#e6f7e9', 
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 8,
    marginBottom: 8,
  },
  slotText: {
    fontSize: 14,
    color: '#2b8a3e', 
    fontWeight: '600',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#D32F2F', 
    marginTop: 5,
    fontStyle: 'italic',
  },
  
  // BASE STYLES
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
  specialtyText: {
    fontSize: 14,
    color: '#6b7a8f',
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
