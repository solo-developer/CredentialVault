import AsyncStorage from '@react-native-async-storage/async-storage';
import Folder from '../types/Folder';

const STORAGE_KEY = "folders";

// Load all folders
export async function getFolders(): Promise<Folder[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save all folders
export async function saveFolders(folders: Folder[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
}

// Add folder with duplicate validation
export async function addFolder(name: string): Promise<{ success: boolean; message: string }> {
  const folders = await getFolders();

  // Check duplicates
  const exists = folders.some(f => f.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    return { success: false, message: "Folder already exists" };
  }

  const newFolder: Folder = {
    id: Date.now().toString(),
    name,
  };

  folders.push(newFolder);
  await saveFolders(folders);

  return { success: true, message: "Folder added" };
}
