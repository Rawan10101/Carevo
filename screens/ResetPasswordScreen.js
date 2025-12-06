import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { auth, firestore, doc, getDoc, deleteDoc } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';  

export default function ResetPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (route?.params) {
      const { email: routeEmail, token: routeToken } = route.params;
      console.log(' Route params:', routeEmail, routeToken);
      
      if (routeEmail && routeToken) {
        setEmail(routeEmail);
        setToken(routeToken);
        validateToken(routeEmail, routeToken);
      } else {
        setError('No email or token provided.');
        setLoading(false);
      }
    } else {
      setError('Invalid navigation.');
      setLoading(false);
    }
  }, [route]);

  const validateToken = async (checkEmail, checkToken) => {
    try {
      console.log('Validating for:', checkEmail);
      const resetRef = doc(firestore, 'passwordResets', checkEmail);
      const resetDoc = await getDoc(resetRef);

      if (!resetDoc.exists()) {
        setError('Reset link not found.');
        setLoading(false);
        return;
      }

      const resetData = resetDoc.data();
      
      if (resetData.token !== checkToken) {
        setError('Invalid reset token.');
        setLoading(false);
        return;
      }

      const expiresAt = resetData.expiresAt.toDate();
      if (new Date() > expiresAt) {
        await deleteDoc(resetRef);
        setError('Reset link expired.');
        setLoading(false);
        return;
      }

      setValidToken(true);
      setLoading(false);
      console.log('Token VALID!');
    } catch (err) {
      console.error('Error:', err);
      setError('Validation failed: ' + err.message);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setError('');
    
    try {
      // OFFICIAL FIREBASE PASSWORD RESET
      await sendPasswordResetEmail(auth, email);
      
      // CLEANUP YOUR TOKEN
      await deleteDoc(doc(firestore, 'passwordResets', email));
      
      Alert.alert(
        'Success!',
        'Official password reset email sent to your inbox!\n\nCheck your email to complete reset.',
        [{ text: 'Done', onPress: () => navigation.replace('Login') }]
      );
    } catch (err) {
      console.error('Reset error:', err);
      setError('Reset failed: ' + err.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.loadingText}>Validating reset link...</Text>
      </KeyboardAvoidingView>
    );
  }

  if (!validToken) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.errorText}>{error || 'Invalid reset link'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.backButtonText}>← Back to Login</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Confirmed for {email}</Text>
      
      <TouchableOpacity 
        style={styles.resetButton}
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.resetButtonText}>
          {loading ? 'Sending...' : 'Send Reset Email'}
        </Text>
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </KeyboardAvoidingView>
  );
}

const styles = {
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8f9fa' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: '#28813fff' },
  subtitle: { fontSize: 16, marginBottom: 40, textAlign: 'center', color: '#666' },
  resetButton: {
    backgroundColor: '#28813fff',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  resetButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: 'red', textAlign: 'center', fontSize: 14, marginTop: 16 },
  loadingText: { fontSize: 18, textAlign: 'center', color: '#666' },
  backButton: { marginTop: 20, padding: 12, alignItems: 'center' },
  backButtonText: { color: '#28813fff', fontWeight: 'bold', fontSize: 16 }
};
