import { authorize, refresh } from "react-native-app-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { oneDriveConfig } from "./AuthConfig";
import { BackupData } from "./LocalBackupService";

const TOKEN_KEY = "onedrive_token";
const REFRESH_KEY = "onedrive_refresh";

export async function loginToOneDrive() {
    debugger;
  const result = await authorize(oneDriveConfig);

  await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
  await AsyncStorage.setItem(REFRESH_KEY, result.refreshToken ?? "");

  return result;
}

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
    "https://graph.microsoft.com/v1.0/me/drive/special/approot:/backup.json:/content";

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

export async function downloadBackup(): Promise<BackupData> {
  const token = await getValidToken();
  if (!token) throw new Error("Not authenticated");

  const url =
    "https://graph.microsoft.com/v1.0/me/drive/special/approot:/backup.json:/content";

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("No backup found");

  return await res.json();
}
