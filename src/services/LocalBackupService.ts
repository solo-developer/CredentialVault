import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BackupData {
  folders: any[];
  items: any[];
  masterPassword: string | null;
  username: string | null;
}

export async function createBackupJSON(): Promise<BackupData> {
  const folders = JSON.parse((await AsyncStorage.getItem("folders")) || "[]");
  const items = JSON.parse((await AsyncStorage.getItem("items")) || "[]");
  const masterPassword = await AsyncStorage.getItem("masterPassword");
  const username = await AsyncStorage.getItem("username");

  return {
    folders,
    items,
    masterPassword,
    username,
  };
}

export async function restoreBackupJSON(data: BackupData) {
  if (data.folders) await AsyncStorage.setItem("folders", JSON.stringify(data.folders));
  if (data.items) await AsyncStorage.setItem("items", JSON.stringify(data.items));
  if (data.masterPassword) await AsyncStorage.setItem("masterPassword", data.masterPassword);
  if (data.username) await AsyncStorage.setItem("username", data.username);
}
