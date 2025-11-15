import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { firestore } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ClinicsScreen = ({ navigation }) => {
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchClinics();
  }, []);

  // Fetch clinics from Firestore
  const fetchClinics = async () => {
    try {
      const clinicsRef = collection(firestore, 'Clinics');
      const querySnapshot = await getDocs(clinicsRef);
      
      const clinicsList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Clinic data:', doc.id, data);
        
        // Handle both "Name" and "Name " (with trailing space)
        const clinicName = data.Name || data['Name '] || data.name || 'Unnamed Clinic';
        
        clinicsList.push({
          id: doc.id,
          Name: clinicName.trim(), // Trim any extra spaces
          Doctors: data.Doctors || [],
        });
      });

      // Sort by name
      clinicsList.sort((a, b) => {
        const nameA = a.Name || '';
        const nameB = b.Name || '';
        return nameA.localeCompare(nameB);
      });

      setClinics(clinicsList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      setIsLoading(false);
    }
  };

  // Loading view
  const LoadingView = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2b8a3e" />
      <Text style={styles.loadingText}>Loading Clinics...</Text>
    </View>
  );

  // Render each clinic card
  const renderClinicItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clinicCard}
      onPress={() => 
        navigation.navigate('DoctorList', {
          clinicId: item.id,
          clinicName: item.Name,
          doctorIds: item.Doctors,
        })
      }
      activeOpacity={0.7}
    >
      <Text style={styles.clinicName}>{item.Name}</Text>
      {item.Doctors && item.Doctors.length > 0 && (
        <Text style={styles.doctorCount}>
          {item.Doctors.length} {item.Doctors.length === 1 ? 'Doctor' : 'Doctors'}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Select a Clinic</Text>
      {clinics.length === 0 ? (
        <Text style={styles.noDataText}>No clinics available at the moment.</Text>
      ) : (
        <FlatList
          data={clinics}
          keyExtractor={item => item.id}
          renderItem={renderClinicItem}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 15,
    marginLeft: 5,
    color: '#333',
  },
  clinicCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2b8a3e',
  },
  doctorCount: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
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
    paddingBottom: 20,
  },
});

export default ClinicsScreen;
