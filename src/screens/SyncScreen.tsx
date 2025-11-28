import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  loginOneDrive,
  uploadBackup,
  downloadBackupFile,
  disconnectOneDrive,
  getConnectedEmail,
  isOneDriveConnected,
} from '../services/OnedriveService';

import { pick, types } from '@react-native-documents/picker';
import { loadBackupFromFile } from '../services/BackupMergeService';
import { createBackupJSON } from '../services/LocalBackupService';
import { requestStoragePermission } from '../services/PermissionService';
import { GlobalStyles } from '../styles/global';

export default function SyncScreen({ navigation }: any) {
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const initConnection = async () => {
      const connected = await isOneDriveConnected();
      setConnected(connected);

      if (connected) {
        const email = await getConnectedEmail();
        setEmail(email);
      }
    };

    initConnection();
  }, []);
  const handleConnectOneDrive = async () => {
    try {
      await loginOneDrive();
      const loggedEmail = await getConnectedEmail();
      setEmail(loggedEmail);
      setConnected(true);
      Alert.alert('Success', 'Connected to OneDrive');
    } catch (e: any) {
      Alert.alert('Error', e.toString());
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect OneDrive',
      'Are you sure you want to disconnect the current OneDrive account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await disconnectOneDrive();
            setConnected(false);
            setEmail(null);
            Alert.alert('Disconnected', 'OneDrive account removed.');
          },
        },
      ],
    );
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const data = await createBackupJSON();
      await uploadBackup(data);
      setSyncing(false);
      Alert.alert('Success', 'Backup uploaded to OneDrive.');
    } catch (err: any) {
      setSyncing(false);
      Alert.alert('Error', err.toString());
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const ok = await requestStoragePermission();
      if (!ok) return;

      const path = await downloadBackupFile();
      Alert.alert('Downloaded', `Saved to: ${path}`);
    } catch (err) {
      console.error(err);
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

  return (
    <View style={styles.container}>
      <Text style={GlobalStyles.subtitle}>OneDrive Sync</Text>

      {/* CONNECTION CARD */}
      <View style={styles.card}>
        <Ionicons
          name={connected ? 'cloud-done' : 'cloud-outline'}
          size={38}
          color={connected ? '#2ecc71' : '#999'}
        />

        <Text style={styles.cardTitle}>
          {connected ? 'Connected to OneDrive' : 'Not Connected'}
        </Text>

        {connected && <Text style={styles.emailText}>{email}</Text>}

        {/* Connect / Disconnect Button */}
        {!connected ? (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: '#007bff' }]}
            onPress={handleConnectOneDrive}
          >
            <Ionicons name="link" size={22} color="#fff" />
            <Text style={styles.mainButtonText}>Connect OneDrive</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: '#e74c3c' }]}
            onPress={handleDisconnect}
          >
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text style={styles.mainButtonText}>Disconnect Account</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ACTIONS SECTION */}
      <Text style={styles.sectionTitle}>Backup Options</Text>

      <TouchableOpacity style={styles.actionButton} onPress={handleSync}>
        {syncing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={24} color="#fff" />
            <Text style={styles.actionText}>Sync Data to OneDrive</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleDownloadBackup}
      >
        <Ionicons name="cloud-download-outline" size={24} color="#fff" />
        <Text style={styles.actionText}>Download Backup</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={handleLoadFile}>
        <Ionicons name="folder-open-outline" size={24} color="#fff" />
        <Text style={styles.actionText}>Load Backup from File</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f5f6fa',
  },

  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d3436',
  },

  card: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 25,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: '700',
  },

  emailText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginBottom: 10,
  },

  mainButton: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  mainButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#2d3436',
  },

  actionButton: {
    backgroundColor: '#0984e3',
    padding: 15,
    borderRadius: 10,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});
