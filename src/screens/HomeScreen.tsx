import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Folder {
  id: string;
  name: string;
}

interface Item {
  id: string;
  folderId: string;
  name: string;
  username: string;
  password: string;
  url: string;
  customFields: any[];
}

const HomeScreen = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const storedFolders = await AsyncStorage.getItem("folders");
      const storedItems = await AsyncStorage.getItem("items");

      setFolders(storedFolders ? JSON.parse(storedFolders) : []);
      setItems(storedItems ? JSON.parse(storedItems) : []);
    };
    loadData();
  }, []);

  const getItemCount = (folderId: string) => {
    return items.filter((item) => item.folderId === folderId).length;
  };

  const renderFolder = ({ item }: { item: Folder }) => (
    <TouchableOpacity style={styles.folderRow}>
      <Text style={styles.folderName}>{item.name}</Text>
      <Text style={styles.itemCount}>{getItemCount(item.id)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
       <Text style={styles.header}>Folders</Text>
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id+ '_'+ item.name}
        renderItem={renderFolder}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  folderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  folderName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemCount: {
    fontSize: 14,
    color: "#666",
  },
});

export default HomeScreen;
