import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from 'react-native';
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
      <TextInput
        placeholder="Gender"
        value={gender}
        onChangeText={setGender}
        style={styles.input}
      />
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
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Button title="Sign Up" onPress={handleSignUp} disabled={loading} />
      )}

      <Button
        title="Go to Login"
        onPress={() => navigation.navigate('Login')}
        style={{ marginTop: 10 }}
      />
    </View>
  );
}

const styles = {
  input: { marginBottom: 10, borderBottomWidth: 1, padding: 6 },
};
