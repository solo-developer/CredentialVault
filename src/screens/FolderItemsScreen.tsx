import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

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
  const navigation = useNavigation<any>();

  useEffect(() => {
    const loadItems = async () => {
      const storedItems = await AsyncStorage.getItem("items");
      const parsedItems: Item[] = storedItems ? JSON.parse(storedItems) : [];
      const filteredItems = parsedItems.filter((i) => i.folderId === folderId);
      setItems(filteredItems);
    };

    const unsubscribe = navigation.addListener("focus", loadItems);
    loadItems(); // initial load

    return unsubscribe;
  }, [folderId]);

  return (
    <View style={styles.container}>
     <View style={styles.header}>
     <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#333" />
     </TouchableOpacity>

      <Text style={styles.title}>{folderName}</Text>
      <View style={{ width: 26 }} /> 
    </View>

      {items.length === 0 ? (
        <Text style={styles.noItemsText}>No items in this folder.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              {/* Item Name */}
              <Text style={styles.itemName}>{item.name}</Text>

              {/* Action icons */}
              <View style={styles.actions}>
                {/* View */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ViewItem", {
                      itemId: item.id,
                      item,
                    })
                  }
                >
                  <Ionicons name="eye-outline" size={24} color="#007bff" />
                </TouchableOpacity>

                {/* Edit */}
                <TouchableOpacity
                  style={{ marginLeft: 18 }}
                  onPress={() =>
                    navigation.navigate("EditItem", {
                      itemId: item.id,
                      item,
                    })
                  }
                >
                  <Ionicons name="create-outline" size={24} color="#28a745" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fa" },
  title: { fontSize: 20, fontWeight: "bold", flexDirection:"row" },
  noItemsText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 20 },
  itemRow: {
    padding: 12,
    backgroundColor: "#fff",
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: { fontSize: 16, color: "#333" },

  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
  justifyContent: "space-between",
},

});

export default FolderItemsScreen;
