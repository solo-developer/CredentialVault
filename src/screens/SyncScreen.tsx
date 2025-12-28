import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
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
import { useAppTheme, GlobalStyles, AppColors } from '../styles/global';
import { disableAppLock, enableAppLock } from '../utils/AppLockState';

export default function SyncScreen({ navigation }: any) {
  const { colors, styles: themeStyles } = useAppTheme();
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
      disableAppLock();
      const ok = await requestStoragePermission();
      if (!ok) {
        enableAppLock();
        return;
      }
      const path = await downloadBackupFile();
      enableAppLock();
      Alert.alert('Downloaded', `Saved to: ${path}`);
    } catch (err) {
      enableAppLock();
      console.error(err);
    }
  };

  const handleLoadFile = async () => {
    try {
      disableAppLock();
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
              enableAppLock();
              Alert.alert('Done', res);
            },
          },
          {
            text: 'Append',
            onPress: async () => {
              const res = await loadBackupFromFile(file.uri, false);
              enableAppLock();
              Alert.alert('Done', res);
            },
          },
          {
            text: 'Cancel', style: 'cancel',
            onPress: async () => {
              enableAppLock();
            },
          },
        ],
      );
    } catch (err) {
      enableAppLock();
      console.error(err);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={themeStyles.container}>
      <Text style={themeStyles.subtitle}>Cloud Sync</Text>

      {/* CONNECTION CARD */}
      <View style={[themeStyles.card, styles.statusCard]}>
        <View style={[styles.iconContainer, { backgroundColor: connected ? `${colors.success}15` : `${colors.textMuted}10` }]}>
          <Ionicons
            name={connected ? 'cloud-done' : 'cloud-offline-outline'}
            size={40}
            color={connected ? colors.success : colors.textMuted}
          />
        </View>

        <Text style={[styles.cardTitle, { color: colors.textMain }]}>
          {connected ? 'OneDrive Connected' : 'Not Connected'}
        </Text>

        {connected ? (
          <Text style={[styles.emailText, { color: colors.textMuted }]}>{email}</Text>
        ) : (
          <Text style={[styles.emailText, { color: colors.textMuted }]}>Connect to store your data safely in cloud.</Text>
        )}

        {/* Connect / Disconnect Button */}
        {!connected ? (
          <TouchableOpacity
            style={[themeStyles.button, { width: '100%', marginTop: 20 }]}
            onPress={handleConnectOneDrive}
          >
            <Text style={themeStyles.buttonText}>Connect OneDrive</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.disconnectBtn}
            onPress={handleDisconnect}
          >
            <Text style={[styles.disconnectText, { color: colors.danger }]}>Disconnect Account</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ACTIONS SECTION */}
      <Text style={[styles.sectionHeader, { color: colors.textMain }]}>Backup & Restore</Text>

      <View style={themeStyles.card}>
        <TouchableOpacity style={styles.actionRow} onPress={handleSync} disabled={!connected || syncing}>
          <View style={[styles.actionIcon, { backgroundColor: `${colors.primary}15` }]}>
            {syncing ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} />}
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionTitle, { color: colors.textMain }, !connected && { color: colors.textLight }]}>Backup to Cloud</Text>
            <Text style={[styles.actionDesc, { color: colors.textMuted }]}>Upload your vault to OneDrive</Text>
          </View>
          {connected && <Ionicons name="chevron-forward" size={18} color={colors.textLight} />}
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.actionRow} onPress={handleDownloadBackup} disabled={!connected}>
          <View style={[styles.actionIcon, { backgroundColor: `${colors.warning}15` }]}>
            <Ionicons name="cloud-download-outline" size={22} color={colors.warning} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionTitle, { color: colors.textMain }, !connected && { color: colors.textLight }]}>Download Data</Text>
            <Text style={[styles.actionDesc, { color: colors.textMuted }]}>Save a copy to your device</Text>
          </View>
          {connected && <Ionicons name="chevron-forward" size={18} color={colors.textLight} />}
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.actionRow} onPress={handleLoadFile}>
          <View style={[styles.actionIcon, { backgroundColor: `${colors.success}15` }]}>
            <Ionicons name="document-text-outline" size={22} color={colors.success} />
          </View>
          <View style={styles.actionInfo}>
            <Text style={[styles.actionTitle, { color: colors.textMain }]}>Import Backup</Text>
            <Text style={[styles.actionDesc, { color: colors.textMuted }]}>Restore from a .json file</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {!connected && (
        <View style={[styles.warningBox, { backgroundColor: `${colors.textMuted}08` }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.warningText, { color: colors.textMuted }]}>Sign in to OneDrive to enable cloud backup and multi-device sync.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textMain,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  disconnectBtn: {
    marginTop: 15,
    padding: 10,
  },
  disconnectText: {
    color: AppColors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.textMain,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textMain,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 13,
    color: AppColors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginLeft: 60,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: `${AppColors.textMuted}08`,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  warningText: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  }
});
