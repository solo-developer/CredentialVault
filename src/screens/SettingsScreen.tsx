import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function SettingsScreen() {
  const handleImport = () => {
    Alert.alert('Import', 'Import JSON functionality will be implemented here');
  };

  const handleExport = () => {
    Alert.alert('Export', 'Export JSON functionality will be implemented here');
  };

  const handleProfile = () => {
    Alert.alert('Profile', 'Profile settings will be implemented here');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={handleImport}>
        <Text style={styles.buttonText}>Import JSON</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleExport}>
        <Text style={styles.buttonText}>Export JSON</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleProfile}>
        <Text style={styles.buttonText}>User Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  button: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
