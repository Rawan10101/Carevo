import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { auth, firestore, doc, getDoc, collection, query, where, getDocs, setDoc, } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import emailjs from '@emailjs/browser';

emailjs.init('YOUR_PUBLIC_KEY'); // Replace with your EmailJS Public Key

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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
        setError(`Your account role does not match the selected role (${role}).`);
        setLoading(false);
        return;
      }

      navigation.replace('Home', { userRole: role });
    } catch (err) {
      setError(err.message.replace('Firebase:', '').trim());
    }
    setLoading(false);
  };

 const handleForgotPassword = async () => {
  if (!email || !email.includes('@')) {
    setError('Please enter a valid email address.');
    return;
  }

  setResetLoading(true);
  setError('');

  try {
    // 1. Find user
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const userQuery = await getDocs(q);

    if (userQuery.empty) {
      setError('No account found with this email address.');
      setResetLoading(false);
      return;
    }

    const userDoc = userQuery.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();

    // 2. Generate token
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                      Math.random().toString(36).substring(2, 15);

    // 3. Save token
    const resetData = {
      userId,
      token: resetToken,
      email,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date()
    };
    if (userData.role) resetData.role = userData.role;

    await setDoc(doc(firestore, 'passwordResets', email), resetData);

    // 4. ✅ MANUAL NAVIGATION (No EmailJS)
    Alert.alert(
      '✅ Reset Link Ready!',
      `Token saved! Navigate manually:\n\n` +
      `Email: ${email}\n` +
      `Token: ${resetToken}\n\n` +
      `Tap "Go to Reset" to test!`,
      [
        {
          text: 'Go to Reset',
          onPress: () => navigation.navigate('ResetPassword', { 
            email: email, 
            token: resetToken 
          })
        },
        { text: 'Cancel' }
      ]
    );

  } catch (err) {
    console.error('Error:', err);
    setError('Failed: ' + err.message);
  }

  setResetLoading(false);
};

  return (
    <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', padding: 24 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>Login</Text>

      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" 
        style={{ borderBottomWidth: 1, marginBottom: 14, fontSize: 16, paddingBottom: 6 }} />

      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry 
        style={{ borderBottomWidth: 1, marginBottom: 14, fontSize: 16, paddingBottom: 6 }} />

      <TouchableOpacity onPress={handleForgotPassword} style={{ alignItems: 'flex-end', marginBottom: 24 }} disabled={resetLoading}>
        <Text style={{ color: '#28813fff', fontWeight: 'bold', fontSize: 14, opacity: resetLoading ? 0.5 : 1 }}>
          {resetLoading ? 'Sending...' : 'Forgot Password?'}
        </Text>
      </TouchableOpacity>

      <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Select Role:</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 }}>
        {roles.map((r) => (
          <TouchableOpacity key={r} onPress={() => setRole(r)} style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, backgroundColor: role === r ? '#28813fff' : '#ccc' }}>
            <Text style={{ color: role === r ? '#fff' : '#333', fontWeight: role === r ? 'bold' : 'normal' }}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#28813fff" style={{ marginBottom: 20 }} />
      ) : (
        <>
          <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#28813fff', padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')} style={{ alignItems: 'center' }}>
            <Text style={{ color: '#28813fff', fontWeight: 'bold', fontSize: 16 }}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </>
      )}

      {error ? <Text style={{ color: 'red', marginTop: 16, fontSize: 14, textAlign: 'center' }}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}
