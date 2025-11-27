import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import {
  loginOneDrive,
  uploadBackup,
  downloadBackupFile,
} from '../services/OnedriveService';
import { loadBackupFromFile } from '../services/BackupMergeService';
import { pick, types } from '@react-native-documents/picker';
import { createBackupJSON } from '../services/LocalBackupService';
import { GlobalStyles } from '../styles/global';
import { requestStoragePermission } from '../services/PermissionService';

export default function SyncScreen({ navigation }: any) {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const handleConnectOneDrive = async () => {
    try {
      await loginOneDrive();
      setConnected(true);
      Alert.alert('Success', 'Connected to OneDrive');
    } catch (e: any) {
      Alert.alert('Error', e.toString());
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const hasPermission = await requestStoragePermission();

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Please allow storage access to save the downloaded backup.',
        );
        return;
      }

      const path = await downloadBackupFile();
      Alert.alert('Downloaded', `Saved to: ${path}`);
    } catch (e: any) {
      Alert.alert('Error', e.toString());
    }
  };

  const handleLoadFile = async () => {
    try {
      const result = await pick({
        type: [types.json],
        allowMultiSelection: false,
      });

      const file = result[0];

      Alert.alert(
        'Load Backup',
        'Do you want to overwrite existing data or append?',
        [
          {
            text: 'Overwrite',
            onPress: async () => {
              const res = await loadBackupFromFile(file.uri, true);
              Alert.alert('Done', res);
            },
          },
          {
            text: 'Append',
            onPress: async () => {
              const res = await loadBackupFromFile(file.uri, false);
              Alert.alert('Done', res);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ],
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncToOneDrive = async () => {
    try {
      setSyncing(true);
      const data = await createBackupJSON();
      await uploadBackup(data);
      setSyncing(false);
      Alert.alert('Success', 'Backup uploaded to OneDrive.');
    } catch (e) {
      setSyncing(false);
      Alert.alert('Error', String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sync to Onedrive</Text>

      <TouchableOpacity style={styles.button} onPress={handleConnectOneDrive}>
        <Text style={styles.buttonText}>
          {connected ? 'Connected ✔' : 'Connect OneDrive'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSyncToOneDrive}
        disabled={syncing}
      >
        {syncing ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ActivityIndicator color="#fff" />
            <Text style={[GlobalStyles.buttonText, { marginLeft: 10 }]}>
              Syncing...
            </Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Sync Local Data to OneDrive</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleDownloadBackup}>
        <Text style={styles.buttonText}>Download Backup</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLoadFile}>
        <Text style={styles.buttonText}>Load Backup File</Text>
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
