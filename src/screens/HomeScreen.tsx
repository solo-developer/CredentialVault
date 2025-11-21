// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { getFolders } from "../services/FolderService";

export default function HomeScreen({ route }) {
  const [folders, setFolders] = useState([]);

  const loadFolders = async () => {
    const data = await getFolders();
    setFolders(data);
  };

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    if (route.params?.refresh) loadFolders();
  }, [route.params]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Folders</Text>

      <FlatList
        data={folders}
        keyExtractor={(item, index) => item + "_" + index}  
        renderItem={({ item }) => (
          <View style={styles.folderItem}>
            <Text style={styles.folderText}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  folderItem: {
    padding: 15,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 10,
  },
  folderText: { fontSize: 16 },
});
