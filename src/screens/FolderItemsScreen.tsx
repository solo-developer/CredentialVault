import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Item {
  id: string;
  folderId: string;
  name: string;
  username: string;
  password: string;
  url: string;
  customFields: any[];
}

const FolderItemsScreen = ({ route }: any) => {
  const { folderId, folderName } = route.params;
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const loadItems = async () => {
      const storedItems = await AsyncStorage.getItem("items");
      const parsedItems: Item[] = storedItems ? JSON.parse(storedItems) : [];
      const filteredItems = parsedItems.filter((i) => i.folderId === folderId);
      setItems(filteredItems);
    };

    loadItems();
  }, [folderId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{folderName}</Text>
      {items.length === 0 ? (
        <Text style={styles.noItemsText}>No items in this folder.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  noItemsText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 20 },
  itemRow: {
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  itemName: { fontSize: 16, color: "#333" },
});

export default FolderItemsScreen;
