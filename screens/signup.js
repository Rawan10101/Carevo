import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from 'react-native';
import { auth, doc, firestore, serverTimestamp, setDoc } from '../firebaseConfig';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple email regex for validation
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Minimum password length
  const validatePassword = (password) =>
    password.length >= 6;

  const handleSignUp = async () => {
    setError('');

    // Client-side validation
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
        email,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Account created successfully!');
      navigation.navigate('Login');
    } catch (err) {
      // Friendly error messages
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
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        accessible
        accessibilityLabel="Email address"
        style={{ marginBottom: 10, borderBottomWidth: 1, padding: 6 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType="password"
        accessible
        accessibilityLabel="Password"
        style={{ marginBottom: 10, borderBottomWidth: 1, padding: 6 }}
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
