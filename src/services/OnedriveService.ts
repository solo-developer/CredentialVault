// services/OneDriveService.ts
import { authorize, refresh } from "react-native-app-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RNFS from "react-native-fs";
import { oneDriveConfig } from "./AuthConfig";
import { BackupData } from "./LocalBackupService";


const BACKUP_FILENAME = "credentialvault-backup.json";
const TOKEN_KEY = "onedrive_token";
const REFRESH_KEY = "onedrive_refresh";

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

export async function uploadBackup(data: BackupData) {
  const token = await getValidToken();
  if (!token) throw new Error("Not authenticated");

  const uploadUrl =
    `https://graph.microsoft.com/v1.0/me/drive/special/approot:/${BACKUP_FILENAME}:/content`;

  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data, null, 2),
  });

  if (!res.ok) throw new Error("Upload failed");
}

export const downloadBackupFile = async () => {
  const tokens = await getSavedTokens();
  if (!tokens) throw "Not connected to OneDrive";

  const downloadUrl =
    "https://graph.microsoft.com/v1.0/me/drive/special/approot:/" +
    BACKUP_FILENAME +
    ":/content";

  const response = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });

  if (!response.ok) throw "File not found in OneDrive";

  const text = await response.text();

  // Save to Downloads folder (Android)
  const path = `${RNFS.DownloadDirectoryPath}/${BACKUP_FILENAME}`;
  await RNFS.writeFile(path, text, "utf8");

  return path;
};
