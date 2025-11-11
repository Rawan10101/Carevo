import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { auth, firestore, doc, getDoc } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient'); // default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['doctor', 'patient', 'nurse'];

  const handleLogin = async () => {
    setError('');
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userRef = doc(firestore, 'users', userCredential.user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        setError('User data not found.');
        setLoading(false);
        return;
      }

      const userData = userSnapshot.data();

      if (userData.role !== role) {
        setError(`Your account role does not match the selected role (${role}). Please select the correct role.`);
        setLoading(false);
        return;
      }

      // Navigate after successful login with role
      navigation.replace('Home', { userRole: role });
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, justifyContent: 'center', padding: 24 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{ borderBottomWidth: 1, marginBottom: 14, fontSize: 16, paddingBottom: 6 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 24, fontSize: 16, paddingBottom: 6 }}
      />

      <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Select Role:</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRole(r)}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 20,
              borderRadius: 20,
              backgroundColor: role === r ? '#097ae6' : '#ccc',
            }}
          >
            <Text style={{ color: role === r ? '#fff' : '#333', fontWeight: role === r ? 'bold' : 'normal' }}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#097ae6" style={{ marginBottom: 20 }} />
      ) : (
        <>
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: '#097ae6',
              padding: 14,
              borderRadius: 8,
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ alignItems: 'center' }}>
            <Text style={{ color: '#097ae6', fontWeight: 'bold', fontSize: 16 }}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </>
      )}

      {error ? <Text style={{ color: 'red', marginTop: 16, fontSize: 14 }}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}
