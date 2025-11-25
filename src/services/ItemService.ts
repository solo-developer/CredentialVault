import AsyncStorage from '@react-native-async-storage/async-storage';
import Item from '../types/Item';
import { ITEM_STORAGE_KEY } from '../Constants';


export async function addItem(item : Item): Promise<{ success: boolean; message: string }> {
  const storedItems = await AsyncStorage.getItem(ITEM_STORAGE_KEY);
    const items = storedItems ? JSON.parse(storedItems) : [];

    await AsyncStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify([...items, item]));
    return { success: true, message: "Item added" };
}

export async function getItems(): Promise<Item[]> {
  const data = await AsyncStorage.getItem(ITEM_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}