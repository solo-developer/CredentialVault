import AsyncStorage from '@react-native-async-storage/async-storage';
import Folder from '../types/Folder';
import { getItems } from './ItemService';
import { FOLDER_STORAGE_KEY, ITEM_STORAGE_KEY } from '../Constants';


// Load all folders
export async function getFolders(): Promise<Folder[]> {
  const data = await AsyncStorage.getItem(FOLDER_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save all folders
export async function saveFolders(folders: Folder[]) {
  await AsyncStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(folders));
}

export async function deleteFolder(folderId: string) {
  const folders = await getFolders();
  const items = await getItems(); 

  const selectedFolder = folders.find(f => f.id === folderId);
  if (!selectedFolder)
    return { success: false, message: "Folder does not exist" };

  // Remove the folder
  const updatedFolders = folders.filter(f => f.id !== folderId);

  // OPTIONAL: Delete items inside this folder
  // Remove this section if you do NOT want to delete items.
  const updatedItems = items.filter(item => item.folderId !== folderId);

  // Save updated folder list
  await AsyncStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(updatedFolders));

  // Save updated items list
  await AsyncStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(updatedItems));

  return { success: true, message: "Folder deleted successfully" };
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
