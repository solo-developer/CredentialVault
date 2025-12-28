// src/services/BackgroundSync.ts

import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import BackgroundService from 'react-native-background-actions';
import BackgroundFetch from 'react-native-background-fetch';
import { createBackupJSON } from './LocalBackupService';
import { uploadBackup, isOneDriveConnected } from './OnedriveService';

/**
 * Checks internet connectivity and triggers OneDrive sync.
 */
const runSyncIfOnline = async () => {
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    console.log('[BackgroundSync] No internet, skipping sync');
    return;
  }

  const isConnected = await isOneDriveConnected();
  if (!isConnected) {
    console.log('[BackgroundSync] OneDrive not connected, skipping sync');
    return;
  }

  try {
    // Update notification on Android if running
    if (Platform.OS === 'android' && BackgroundService.isRunning()) {
      await BackgroundService.updateNotification({
        taskDesc: 'Syncing your vault to OneDrive...',
      });
    }

    const data = await createBackupJSON();
    await uploadBackup(data);
    
    console.log('[BackgroundSync] Vault synced successfully');

    if (Platform.OS === 'android' && BackgroundService.isRunning()) {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      await BackgroundService.updateNotification({
        taskDesc: `Last synced at ${now}. Next sync in 15 mins.`,
      });
    }
  } catch (err) {
    console.log('[BackgroundSync] Vault sync failed:', err);
    if (Platform.OS === 'android' && BackgroundService.isRunning()) {
      await BackgroundService.updateNotification({
        taskDesc: 'Sync failed. Will retry in 15 mins.',
      });
    }
  }
};

/* ------------------------- ANDROID BACKGROUND TASK ------------------------- */

const androidBackgroundTask = async () => {
  // Initial sync on start
  await runSyncIfOnline();
  
  while (BackgroundService.isRunning()) {
    // Wait 15 minutes before next sync
    await new Promise(resolve => setTimeout(() => resolve(null), 15 * 60 * 1000));
    await runSyncIfOnline();
  }
};

export const startAndroidBackgroundSync = async () => {
  if (BackgroundService.isRunning()) return;

  try {
    await BackgroundService.start(androidBackgroundTask, {
      taskName: 'CredentialVaultSync',
      taskTitle: 'Vault Auto-Sync',
      taskDesc: 'Checking for changes...',
      taskIcon: { name: 'ic_launcher', type: 'drawable' },
      color: '#6366f1',
      parameters: {
        delay: 15 * 60 * 1000,
      },
    });
  } catch (e) {
    console.log('Error starting background sync:', e);
  }
};

/* --------------------------- IOS BACKGROUND TASK --------------------------- */

export const startIOSBackgroundSync = () => {
  BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // in minutes (iOS decides exact interval)
      stopOnTerminate: false,   // continue after app is closed
      startOnBoot: true,
      enableHeadless: true,
      requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
    },
    async (taskId) => {
      console.log('[BackgroundFetch] Event received: ', taskId);
      await runSyncIfOnline();
      BackgroundFetch.finish(taskId);
    },
    error => {
      console.log('[BackgroundSync] BackgroundFetch failed:', error);
    },
  );
};

/* ------------------------- CROSS-PLATFORM INIT ---------------------------- */

export const initBackgroundSync = () => {
  if (Platform.OS === 'android') {
    startAndroidBackgroundSync();
  } else {
    startIOSBackgroundSync();
  }
};
