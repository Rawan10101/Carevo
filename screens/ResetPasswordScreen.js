import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { auth, firestore, doc, getDoc, deleteDoc } from '../firebaseConfig';
import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth';

export default function ResetPasswordScreen({ route, navigation }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // ✅ FIXED: Safe route params handling
    if (route?.params) {
      const { email: routeEmail, token: routeToken } = route.params;
      console.log('🔗 Route params:', routeEmail, routeToken);
      
      if (routeEmail && routeToken) {
        setEmail(routeEmail);
        setToken(routeToken);
        validateToken(routeEmail, routeToken);
      } else {
        setError('No email or token provided. Please request a new password reset.');
        setLoading(false);
      }
    } else {
      setError('Invalid navigation. Please request a new password reset.');
      setLoading(false);
    }
  }, [route]);

  const validateToken = async (checkEmail, checkToken) => {
    try {
      console.log('🔍 Validating token for:', checkEmail);
      const resetRef = doc(firestore, 'passwordResets', checkEmail);
      const resetDoc = await getDoc(resetRef);

      if (!resetDoc.exists()) {
        setError('Reset link not found.');
        setLoading(false);
        return;
      }

      const resetData = resetDoc.data();
      console.log('📋 Reset data:', resetData);

      // Check token match and expiry
      if (resetData.token !== checkToken) {
        setError('Invalid reset token.');
        setLoading(false);
        return;
      }

      if (new Date(resetData.expiresAt.toDate()) < new Date()) {
        await deleteDoc(resetRef);
        setError('Reset link has expired.');
        setLoading(false);
        return;
      }

      setValidToken(true);
      setLoading(false);
      console.log('✅ Token valid!');
    } catch (err) {
      console.error('❌ Token validation error:', err);
      setError('Error validating reset link: ' + err.message);
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Sign in user first (required for updatePassword)
      await signInWithEmailAndPassword(auth, email, 'temp-password-ignore');
      
      // Update password
      await updatePassword(auth.currentUser, newPassword);
      
      // Delete used token
      await deleteDoc(doc(firestore, 'passwordResets', email));

      Alert.alert(
        '✅ Password Reset Successful!',
        'You can now login with your new password.',
        [
          { text: 'Login', onPress: () => navigation.replace('Login') }
        ]
      );
    } catch (err) {
      console.error('❌ Reset error:', err);
      setError('Failed to reset password: ' + err.message);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', padding: 24 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>Validating reset link...</Text>
      </KeyboardAvoidingView>
    );
  }

  if (!validToken) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', padding: 24 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={{ fontSize: 18, textAlign: 'center', marginBottom: 24, color: 'red' }}>
          {error}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center' }}>
          <Text style={{ color: '#28813fff', fontWeight: 'bold', fontSize: 16 }}>Request New Reset Link</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, justifyContent: 'center', padding: 24 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' }}>
        Reset Password
      </Text>
      <Text style={{ fontSize: 16, marginBottom: 24, textAlign: 'center', color: '#666' }}>
        Enter your new password for {email}
      </Text>

      <TextInput
        placeholder="New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 14, fontSize: 16, paddingBottom: 6 }}
      />

      <TextInput
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={{ borderBottomWidth: 1, marginBottom: 24, fontSize: 16, paddingBottom: 6 }}
      />

      {loading ? (
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Updating password...</Text>
      ) : (
        <TouchableOpacity
          onPress={handleResetPassword}
          style={{
            backgroundColor: '#28813fff',
            padding: 14,
            borderRadius: 8,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Reset Password</Text>
        </TouchableOpacity>
      )}

      {error ? (
        <Text style={{ color: 'red', marginTop: 16, fontSize: 14, textAlign: 'center' }}>
          {error}
        </Text>
      ) : null}
    </KeyboardAvoidingView>
  );
}
