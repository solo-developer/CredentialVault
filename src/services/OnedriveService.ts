// services/OneDriveService.ts
import { authorize, refresh } from "react-native-app-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNFS from "react-native-fs";
import { oneDriveConfig } from "./AuthConfig";
import { BackupData } from "./LocalBackupService";

const BACKUP_FILENAME = "credentialvault-backup.json";
const TOKEN_KEY = "onedrive_token";
const REFRESH_KEY = "onedrive_refresh";

// -------------------- Authentication --------------------
export const loginOneDrive = async () => {
  const authState = await authorize(oneDriveConfig);
  await AsyncStorage.setItem("onedrive_auth", JSON.stringify(authState));
  await AsyncStorage.setItem(TOKEN_KEY, authState.accessToken);
  await AsyncStorage.setItem(REFRESH_KEY, authState.refreshToken ?? "");
  return authState;
};

export const getSavedTokens = async () => {
  const data = await AsyncStorage.getItem("onedrive_auth");
  return data ? JSON.parse(data) : null;
};

export const saveTokens = async (tokens: any) => {
  await AsyncStorage.setItem("onedrive_auth", JSON.stringify(tokens));
};

export async function getValidToken() {
  const refreshToken = await AsyncStorage.getItem(REFRESH_KEY);
  if (!refreshToken) return null;

  try {
    const refreshed = await refresh(oneDriveConfig, { refreshToken });
    await AsyncStorage.setItem(TOKEN_KEY, refreshed.accessToken);
    await AsyncStorage.setItem(REFRESH_KEY, refreshed.refreshToken ?? refreshToken);
    return refreshed.accessToken;
  } catch {
    return null;
  }
}

// -------------------- Upload Backup --------------------
export async function uploadBackup(data: BackupData) {
  const token = await getValidToken();
  if (!token) throw new Error("Not authenticated");

  const jsonStr = JSON.stringify(data, null, 2);

  const uploadUrl =
    `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${BACKUP_FILENAME}:/content`;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/gzip",
    },
    body: jsonStr,
  });

  if (!res.ok) throw new Error("Upload failed");

  // Delete old versions to prevent OneDrive storage growth
  await cleanupOldVersions(token);
}

// -------------------- Delete old versions --------------------
async function cleanupOldVersions(token: string) {
  try {
    // 1. Get the file metadata to obtain the item-id
    const fileMetaRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${BACKUP_FILENAME}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!fileMetaRes.ok) {
      console.warn("File not found, cannot cleanup versions");
      return;
    }

    const fileMeta = await fileMetaRes.json();
    const itemId = fileMeta.id;

    // 2. List all versions of the file
    const versionsRes = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/versions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!versionsRes.ok) {
      console.warn("Failed to fetch file versions");
      return;
    }

    const versionsData = await versionsRes.json();
    const versions = versionsData.value;

    // 3. Delete all old versions, keep only the latest
    for (let i = 0; i < versions.length - 1; i++) {
      const versionId = versions[i].id;
      const deleteRes = await fetch(
        `https://graph.microsoft.com/v1.0/me/drive/items/${itemId}/versions/${versionId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!deleteRes.ok) {
        console.warn(`Failed to delete version ${versionId}`);
        console.log('delete Res',await deleteRes.json())
      }
     
    }

    console.log("Old versions cleaned up successfully");
  } catch (err) {
    console.warn("Error cleaning up old OneDrive versions:", err);
  }
}


// -------------------- Download Backup --------------------
export const downloadBackupFile = async () => {
  const tokens = await getSavedTokens();
  if (!tokens) throw "Not connected to OneDrive";

  const downloadUrl =
    `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${BACKUP_FILENAME}:/content`;

  const response = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });

  if (!response.ok) throw "File not found in OneDrive";

  const arrayBuffer = await response.arrayBuffer();
  // Decompress
  const decompressed = pako.ungzip(new Uint8Array(arrayBuffer), { to: "string" });

  // Save to Downloads folder (Android)
  const path = `${RNFS.DownloadDirectoryPath}/${BACKUP_FILENAME}`;
  await RNFS.writeFile(path, decompressed, "utf8");

  return path;
};
