import AsyncStorage from "@react-native-async-storage/async-storage";

export interface BackupData {
  folders: any[];
  items: any[];
}

export async function createBackupJSON(): Promise<BackupData> {
  const folders = JSON.parse((await AsyncStorage.getItem("folders")) || "[]");
  const items = JSON.parse((await AsyncStorage.getItem("items")) || "[]");
  
  return {
    folders,
    items
  };
}

export async function restoreBackupJSON(data: BackupData) {
  if (data.folders) await AsyncStorage.setItem("folders", JSON.stringify(data.folders));
  if (data.items) await AsyncStorage.setItem("items", JSON.stringify(data.items));
}
