import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { useRoute } from "@react-navigation/native";
import Item from "../types/Item";
import Folder from "../types/Folder";



const HomeScreen = ({ navigation }: any) => {
  const route = useRoute();
  
  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const loadData = async () => {
        const storedFolders = await AsyncStorage.getItem("folders");
        const storedItems = await AsyncStorage.getItem("items");

        setFolders(storedFolders ? JSON.parse(storedFolders) : []);
        setItems(storedItems ? JSON.parse(storedItems) : []);
      };
  useEffect(() => {
    
    loadData();
  }, []);

  useEffect(() => {
        loadData();
      }, [route.params?.refresh]);

  const getItemCount = (folderId: string) => {
    return items.filter((item) => item.folderId === folderId).length;
  };

  const renderFolder = ({ item }: { item: Folder }) => (
  <TouchableOpacity
    style={styles.folderRow}
    onPress={() => {
      const count = getItemCount(item.id);
      if (count === 0) {
        Alert.alert("No items in this folder.");
      } else {
        navigation.navigate("FolderItems", { folderId: item.id, folderName: item.name });
      }
    }}
  >
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
