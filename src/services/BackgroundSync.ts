// src/services/backgroundSync.ts

import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import BackgroundService from 'react-native-background-actions';
import BackgroundFetch from 'react-native-background-fetch';
import { createBackupJSON } from './LocalBackupService';
import { uploadBackup } from './OnedriveService';

/**
 * Checks internet connectivity and triggers  existing OneDrive sync.
 */
const runSyncIfOnline = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) return;

  try {
    const data = await createBackupJSON();
    await uploadBackup(data);
    console.log('[BackgroundSync] Vault synced successfully');
  } catch (err) {
    console.log('[BackgroundSync] Vault sync failed:', err);
  }
};

/* ------------------------- ANDROID BACKGROUND TASK ------------------------- */

const androidBackgroundTask = async () => {
  while (true) {
    await runSyncIfOnline();
    // Wait 10 minutes before next sync
    await new Promise(resolve => setTimeout(resolve, 10 * 60 * 1000));
  }
};

export const startAndroidBackgroundSync = async () => {
  await BackgroundService.start(androidBackgroundTask, {
    taskName: 'CredentialVaultSync',
    taskTitle: 'Vault Sync',
    taskDesc: 'Syncing Credential Vault to OneDrive',
    taskIcon: {name : 'ic_launcher', type: 'drawable'}
  });
};

/* --------------------------- IOS BACKGROUND TASK --------------------------- */

export const startIOSBackgroundSync = () => {
  BackgroundFetch.configure(
    {
      minimumFetchInterval: 10, // in minutes (iOS decides exact interval)
      stopOnTerminate: false, // continue after app is closed
      startOnBoot: true,
    },
    async () => {
      await runSyncIfOnline();
      BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
    },
    error => {
      console.log('[BackgroundSync] BackgroundFetch failed:', error);
    },
  );
};

/* ------------------------- CROSS-PLATFORM INIT ---------------------------- */

export const initBackgroundSync = () => {
  if (Platform.OS === 'android') startAndroidBackgroundSync();
  else startIOSBackgroundSync();
};
