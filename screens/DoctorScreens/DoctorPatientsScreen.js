import React from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';  // Add StyleSheet
export default function DoctorPatientsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>👥 Patients</Text>
      <Text>Coming Soon...</Text>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: 'center', alignItems: 'center' }, title: { fontSize: 24, fontWeight: 'bold' } });
