import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { auth, doc, firestore, serverTimestamp, setDoc } from '../firebaseConfig';

export default function SignUpScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [genderModalVisible, setGenderModalVisible] = useState(false);

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
  ];

  // Simple validations
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleSignUp = async () => {
    setError('');

    if (!userName || !phoneNumber || !age || !gender) {
      setError('Please fill all fields.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userRef = doc(firestore, 'users', userCredential.user.uid);

      await setDoc(userRef, {
        'User-Name': userName,
        PhoneNumber: phoneNumber,
        Age: age,
        Gender: gender,
        email: email,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (err) {
      let friendlyError = err.message;
      if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'That email is already in use.';
      } else if (err.code === 'auth/invalid-email') {
        friendlyError = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Please choose a stronger password.';
      }
      setError(friendlyError);
    }
    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 10 }}>Create Account</Text>

      <TextInput
        placeholder="User Name"
        value={userName}
        onChangeText={setUserName}
        style={styles.input}
      />
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />

      {/* Gender Selector */}
      <Text style={{ marginBottom: 6, fontSize: 16 }}>Gender</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setGenderModalVisible(true)}
      >
        <Text style={styles.pickerButtonText}>
          {gender ? genderOptions.find(opt => opt.value === gender)?.label : 'Select Gender'}
        </Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      {/* Gender Modal */}
      <Modal
        visible={genderModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setGenderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <FlatList
              data={genderOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setGender(item.value);
                    setGenderModalVisible(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                  {gender === item.value && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setGenderModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSignUp}>
          <Text style={styles.primaryBtnText}>Sign Up</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.secondaryBtnText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  input: {
    marginBottom: 10,
    borderBottomWidth: 1,
    padding: 6,
    borderColor: '#aaa',
  },

  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },

  pickerArrow: {
    fontSize: 12,
    color: '#999',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '50%',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalOptionText: {
    fontSize: 16,
  },

  checkmark: {
    fontSize: 18,
    color: '#28813fff',
    fontWeight: 'bold',
  },

  modalCloseButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },

  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },

  primaryBtn: {
    backgroundColor: '#28813fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  primaryBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  secondaryBtn: {
    borderWidth: 2,
    borderColor: '#28813fff',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },

  secondaryBtnText: {
    color: '#28813fff',
    fontSize: 18,
    fontWeight: '600',
  },
};
