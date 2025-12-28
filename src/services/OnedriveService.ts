// services/OneDriveService.ts
import { authorize, refresh } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { oneDriveConfig } from './AuthConfig';
import { BackupData } from './LocalBackupService';
import RNFetchBlob from 'react-native-blob-util';
import { Platform } from 'react-native';
import { disableAppLock, enableAppLock } from '../utils/AppLockState';
import { requestStoragePermission } from './PermissionService';

const BACKUP_FILENAME = 'credentialvault-backup.json';

const TOKEN_KEY = 'onedrive_token';
const REFRESH_KEY = 'onedrive_refresh';

// ---------------------- TOKEN STORAGE HELPERS ------------------------

export const getSavedTokens = async () => {
  const data = await AsyncStorage.getItem('onedrive_auth');
  return data ? JSON.parse(data) : null;
};

export const saveTokens = async (tokens: any) => {
  // Save entire object
  await AsyncStorage.setItem('onedrive_auth', JSON.stringify(tokens));

  // Store individually for fast access
  if (tokens.accessToken) {
    await AsyncStorage.setItem(TOKEN_KEY, tokens.accessToken);
  }
  if (tokens.refreshToken) {
    await AsyncStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  }
};

// ---------------------- LOGIN / AUTH ------------------------

export const loginOneDrive = async () => {
  disableAppLock();

  // If already authenticated → don't open Microsoft login again
  const existing = await getValidToken();
  if (existing) {
    enableAppLock();
    return { accessToken: existing };
  }

  const authState = await authorize(oneDriveConfig);

  const newState = {
    accessToken: authState.accessToken,
    refreshToken: authState.refreshToken,
    accessTokenExpirationDate: authState.accessTokenExpirationDate,
    tokenType: authState.tokenType,
  };

  await saveTokens(newState);
  enableAppLock();
  return newState;
};

// ---------------------- TOKEN VALIDATION ------------------------

export async function getValidToken() {
  const saved = await getSavedTokens();
  if (!saved) return null;

  const now = Date.now();
  const expires = new Date(saved.accessTokenExpirationDate).getTime();

  // 5 second safety margin
  if (expires - 5000 > now) {
    return saved.accessToken;
  }

  // Refresh token flow
  const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const refreshed = await refresh(oneDriveConfig, { refreshToken });

    // Build clean updated state
    const newState = {
      ...saved,
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken || saved.refreshToken,
      accessTokenExpirationDate: refreshed.accessTokenExpirationDate,
    };

    await saveTokens(newState);

    return newState.accessToken;
  } catch (err) {
    console.log('Failed to refresh OneDrive token:', err);
    return null;
  }
}

// ---------------------- UPLOAD BACKUP ------------------------

export async function uploadBackup(data: BackupData) {
  const token = await getValidToken();
  if (!token) throw new Error('Not authenticated');

  const jsonStr = JSON.stringify(data, null, 2);

  const uploadUrl =
    `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${BACKUP_FILENAME}:/content`;

  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/gzip',
    },
    body: jsonStr,
  });

  if (!res.ok) throw new Error('Upload failed');

  await cleanupOldVersions(token);
}

// ---------------------- CLEAN OLD VERSIONS ------------------------

async function cleanupOldVersions(token: string) {
  try {
    const fileMetaRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${BACKUP_FILENAME}`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!fileMetaRes.ok) {
      console.warn('File not found, cannot cleanup versions');
      return;
    }

    const fileMeta = await fileMetaRes.json();
    const itemId = fileMeta.id;

    const versionsRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/versions`,
      { headers: { Authorization: `Bearer ${token}` } },
    );

    if (!versionsRes.ok) {
      console.warn('Failed to fetch file versions');
      return;
    }

    const versionsData = await versionsRes.json();
    const versions = versionsData.value;

    // Keep newest version only
    for (let i = 0; i < versions.length - 1; i++) {
      const versionId = versions[i].id;

      const deleteRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/versions/${versionId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!deleteRes.ok) {
        console.warn(`Failed to delete version ${versionId}`);
      }
    }

    console.log('Old versions cleaned up successfully');
  } catch (err) {
    console.warn('Error cleaning OneDrive versions:', err);
  }
}

// ---------------------- DOWNLOAD BACKUP ------------------------

export const downloadBackupFile = async () => {
  try {
    const token = await getValidToken();
    if (!token) throw 'Not authenticated';

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) throw 'Storage permission denied';

    const downloadUrl =
      `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${BACKUP_FILENAME}:/content`;

    let path = '';
    if (Platform.OS === 'android') {
      const downloadDir = RNFetchBlob.fs.dirs.DownloadDir;
      path = `${downloadDir}/${BACKUP_FILENAME}`;
      
      const res = await RNFetchBlob.fetch('GET', downloadUrl, {
        Authorization: `Bearer ${token}`
      });

      if (res.respInfo.status !== 200) {
        throw `Server returned ${res.respInfo.status}`;
      }

      const content = await res.text();
      await RNFetchBlob.fs.writeFile(path, content, 'utf8');

      if (Platform.OS === 'android' && RNFetchBlob.android.addCompleteDownload) {
        try {
          await RNFetchBlob.android.addCompleteDownload({
            title: BACKUP_FILENAME,
            description: 'Credential Vault Backup',
            mime: 'application/json',
            path: path,
            showNotification: true,
          });
        } catch (e) {
          console.warn("Could not register download with system:", e);
        }
      }

      return path;
    } else {
      path = RNFetchBlob.fs.dirs.DocumentDir + '/' + BACKUP_FILENAME;
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw 'File not found in OneDrive';
      const content = await response.text();
      await RNFetchBlob.fs.writeFile(path, content, 'utf8');
      return path;
    }
  } catch (err) {
    console.warn('Download Error:', err);
    throw err;
  }
};

export const getOneDriveUserInfo = async () => {
  const token = await getValidToken();
  if (!token) return null;

  try {
    const res = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch account info");

    const profile = await res.json();

    // Store email locally for quick UI access
    if (profile?.userPrincipalName) {
      await AsyncStorage.setItem("onedrive_email", profile.userPrincipalName);
    }

    return profile;
  } catch (err) {
    console.warn("User info fetch error:", err);
    return null;
  }
};


// ---------------------- REMOVE ACCOUNT ------------------------

/**
 * Completely removes OneDrive authentication data.
 * Used when user wants to switch account.
 */
export const disconnectOneDrive = async () => {
  try {
    await AsyncStorage.removeItem("onedrive_auth");
    await AsyncStorage.removeItem("onedrive_email");
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_KEY);

    console.log("OneDrive account disconnected");
    return true;
  } catch (err) {
    console.warn("Failed to disconnect OneDrive:", err);
    return false;
  }
};


// ---------------------- CHECK CONNECTION STATUS ------------------------

/**
 * Returns true if user is logged in and token is still valid.
 */
export const isOneDriveConnected = async () => {
  const token = await getValidToken();
  return token !== null;
};


// ---------------------- GET CONNECTED EMAIL ------------------------

/**
 * Returns the last saved connected OneDrive email.
 * If not saved, it will try fetching from the API once.
 */
export const getConnectedEmail = async () => {
  let email = await AsyncStorage.getItem("onedrive_email");

  if (!email) {
    const profile = await getOneDriveUserInfo();
    email = profile?.userPrincipalName || null;
  }

  return email;
};
