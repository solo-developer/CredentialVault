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

export async function updateItem(updatedItem: Item): Promise<{ success: boolean; message: string }> {
  try {
    const storedItems = await AsyncStorage.getItem(ITEM_STORAGE_KEY);
    const items: Item[] = storedItems ? JSON.parse(storedItems) : [];

    const index = items.findIndex(item => item.id === updatedItem.id);
    if (index === -1) {
      return { success: false, message: "Item not found" };
    }

    // Replace the old item with updated item
    items[index] = updatedItem;

    await AsyncStorage.setItem(ITEM_STORAGE_KEY, JSON.stringify(items));

    return { success: true, message: "Item updated successfully" };
  } catch (error) {
    console.error("Error updating item:", error);
    return { success: false, message: "Failed to update item" };
  }
}