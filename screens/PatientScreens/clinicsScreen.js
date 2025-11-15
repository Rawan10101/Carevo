import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { firestore } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const ClinicsScreen = ({ navigation }) => {
  const [clinics, setClinics] = useState([]);
  const [filteredClinics, setFilteredClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const clinicsRef = collection(firestore, 'Clinics');
      const querySnapshot = await getDocs(clinicsRef);

      const clinicsList = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const clinicName = data.Name || data['Name '] || data.name || 'Unnamed Clinic';

        clinicsList.push({
          id: doc.id,
          Name: clinicName.trim(),
          Doctors: data.Doctors || [],
        });
      });

      clinicsList.sort((a, b) => a.Name.localeCompare(b.Name));

      setClinics(clinicsList);
      setFilteredClinics(clinicsList);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      setIsLoading(false);
    }
  };

  // Filter clinics by name
  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = clinics.filter(c =>
      c.Name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredClinics(filtered);
  };

  const renderClinicItem = ({ item }) => (
    <TouchableOpacity
      style={styles.clinicCard}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('DoctorList', {
          clinicId: item.id,
          clinicName: item.Name,
          doctorIds: item.Doctors,
        })
      }
    >
      <Text style={styles.clinicName}>{item.Name}</Text>
      {item.Doctors?.length > 0 && (
        <Text style={styles.doctorCount}>
          {item.Doctors.length} {item.Doctors.length === 1 ? 'Doctor' : 'Doctors'}
        </Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2b8a3e" />
        <Text style={styles.loadingText}>Loading Clinics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/*  Header */}
      <Text style={styles.headerTitle}>Clinics</Text>

      {/*  Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search clinics..."
          placeholderTextColor="#777"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {filteredClinics.length === 0 ? (
        <Text style={styles.noDataText}>No clinics match your search.</Text>
      ) : (
        <FlatList
          data={filteredClinics}
          keyExtractor={(item) => item.id}
          renderItem={renderClinicItem}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingHorizontal: 15,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 45,
    marginBottom: 18,
    color: '#2b8a3e',
    textAlign: 'center',
  },

  searchContainer: {
    width: '100%',
    marginBottom: 15,
  },

  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  clinicCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  clinicName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2b8a3e',
  },

  doctorCount: {
    fontSize: 13,
    marginTop: 4,
    color: '#666',
    fontStyle: 'italic',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
  },

  loadingText: {
    marginTop: 10,
    color: 'gray',
  },

  noDataText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: 'gray',
  },
});

export default ClinicsScreen;
