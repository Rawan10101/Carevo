import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from 'react-native';
import { auth, doc, firestore, serverTimestamp, setDoc } from '../firebaseConfig';
import { TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function SignUpScreen({ navigation }) {
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <Text style={{ marginBottom: 6, fontSize: 16 }}>Gender</Text>
<View style={styles.pickerContainer}>
  <Picker
    selectedValue={gender}
    onValueChange={(value) => setGender(value)}
    style={styles.picker}
  >
    <Picker.Item label="Select Gender" value="" />
    <Picker.Item label="Male" value="male" />
    <Picker.Item label="Female" value="female" />
  </Picker>
</View>

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
