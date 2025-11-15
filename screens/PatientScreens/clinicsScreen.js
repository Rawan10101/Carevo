import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
// import firestore from '@react-native-firebase/firestore';

const ClinicsScreen = ({ navigation }) => {
  const [clinics, setClinics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for testing - will be removed when integrating with database
  const mockClinics = [
    {
      id: '1',
      name: 'Cardiology Clinic',
      description: 'Specialized in heart and cardiovascular health',
      Doctors: ['doc1', 'doc2', 'doc3'],
    },
    {
      id: '2',
      name: 'Dental Clinic',
      description: 'Complete dental care and cosmetic dentistry',
      Doctors: ['doc4', 'doc5'],
    },
    {
      id: '3',
      name: 'Dermatology Clinic',
      description: 'Skin care and dermatological treatments',
      Doctors: ['doc6', 'doc7', 'doc8', 'doc9'],
    },
    {
      id: '4',
      name: 'Pediatrics Clinic',
      description: 'Healthcare for infants, children, and adolescents',
      Doctors: ['doc10'],
    },
    {
      id: '5',
      name: 'Orthopedics Clinic',
      description: 'Bone, joint, and musculoskeletal care',
      Doctors: ['doc11', 'doc12'],
    },
    {
      id: '6',
      name: 'Neurology Clinic',
      description: 'Brain and nervous system disorders treatment',
      Doctors: ['doc13', 'doc14', 'doc15'],
    },
  ];

  useEffect(() => {
    setIsLoading(true);

    // Using mock data for now
    setTimeout(() => {
      setClinics(mockClinics);
      setIsLoading(false);
    }, 500); // Simulate loading delay

    /* 
    // TODO: Uncomment this when ready to fetch from Firestore
    const fetchClinics = async () => {
      try {
        const clinicsSnapshot = await firestore()
          .collection('Clinics')
          .orderBy('name', 'asc')
          .get();

        const clinicsList = [];
        clinicsSnapshot.forEach(documentSnapshot => {
          clinicsList.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });

        setClinics(clinicsList);
        setIsLoading(false);
      } catch (error) {
        console.error('Firestore error fetching clinics:', error);
        setIsLoading(false);
      }
    };

    fetchClinics();
    */
  }, []);

  // Loading view
  const LoadingView = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2b8a3e" />
      <Text style={styles.loadingText}>Loading Clinics...</Text>
    </View>
  );

  // Render each clinic card
  // const renderClinicItem = ({ item }) => (
  //   <TouchableOpacity
  //     style={styles.clinicCard}
  //     onPress={() => 
  //       navigation.navigate('DoctorList', {
  //         clinicId: item.id,
  //         clinicName: item.name || 'Clinic Details',
  //       })
  //     }
  //     activeOpacity={0.7}
  //   >
  //     <Text style={styles.clinicName}>{item.name || 'Unnamed Clinic'}</Text>
  //     {item.description && (
  //       <Text style={styles.clinicDescription}>{item.description}</Text>
  //     )}
  //     {item.Doctors && (
  //       <Text style={styles.doctorCount}>
  //         {item.Doctors.length} {item.Doctors.length === 1 ? 'Doctor' : 'Doctors'}
  //       </Text>
  //     )}
  //   </TouchableOpacity>
  // );
const renderClinicItem = ({ item }) => (
  <TouchableOpacity
    style={styles.clinicCard}
    onPress={() => 
      navigation.navigate('DoctorList', {
        clinicId: item.id,
        clinicName: item.name || 'Clinic Details',
      })
    }
    activeOpacity={0.7}
  >
    <Text style={styles.clinicName}>{item.name || 'Unnamed Clinic'}</Text>
    {item.description && (
      <Text style={styles.clinicDescription}>{item.description}</Text>
    )}
    {item.Doctors && (
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
  clinicDescription: {
    fontSize: 14,
    color: '#6b7a8f',
    marginBottom: 5,
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
