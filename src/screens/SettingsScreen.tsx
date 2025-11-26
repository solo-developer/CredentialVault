import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

import {
  loginOneDrive,
  uploadBackup,
  downloadBackupFile,
} from '../services/OnedriveService';
import { loadBackupFromFile } from '../services/BackupMergeService';
import { pick, types } from '@react-native-documents/picker';
import { createBackupJSON } from '../services/LocalBackupService';
import { GlobalStyles } from '../styles/global';
import { CommonActions } from '@react-navigation/native';

export default function SettingsScreen({ navigation }: any) {
  
  const changeLoginInformationClicked = async () => {
    navigation.navigate('ChangeLoginScreen');
  };

  const logoutButtonClicked = async () => {
     navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'MasterPasswordSetup' }],
                  }),
                );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={changeLoginInformationClicked}
      >
        <Text style={styles.buttonText}>Change Login Information</Text>
      </TouchableOpacity>

       <TouchableOpacity
        style={styles.button}
        onPress={logoutButtonClicked}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  button: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
