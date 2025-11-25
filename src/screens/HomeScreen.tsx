import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import Item from "../types/Item";
import Folder from "../types/Folder";
import { GlobalStyles } from "../styles/global";
import { showConfirmationDialog } from "../components/ConfirmationDialog";
import { deleteFolder, updateFolderName } from "../services/FolderService";
import RenameFolderModal from "./RenameFolderModel";



const HomeScreen = ({ navigation }: any) => {
  const route = useRoute();
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameFolder, setRenameFolder] = useState<Folder | null>(null);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  // Dropdown state
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuFolder, setMenuFolder] = useState<Folder | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  // Store refs for each folder's three-dot button
  const buttonRefs = useRef<{ [key: string]: TouchableOpacity | null }>({});

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

  // Open dropdown below the button
  const openMenu = (folder: Folder) => {
  const buttonRef = buttonRefs.current[folder.id];
  if (buttonRef) {
    buttonRef.measure(
      (fx, fy, width, height, px, py) => {
        const screenWidth = Dimensions.get("window").width;
        const dropdownWidth = 140; // approximate width of dropdown
        let left = px;

        // If dropdown will overflow, shift it left
        if (px + dropdownWidth > screenWidth - 10) {
          left = screenWidth - dropdownWidth - 10; // 10px margin
        }

        setMenuPosition({ x: left, y: py + height });
        setMenuFolder(folder);
        setMenuVisible(true);
      }
    );
  }
};


  const closeMenu = () => {
    setMenuVisible(false);
    setMenuFolder(null);
  };

  const renderFolder = ({ item }: { item: Folder }) => (
    <View style={styles.folderRow}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => {
          const count = getItemCount(item.id);
          if (count === 0) {
            Alert.alert("No items in this folder.");
          } else {
            navigation.navigate("FolderItems", {
              folderId: item.id,
              folderName: item.name,
            });
          }
        }}
      >
        <Text style={styles.folderName}>{item.name}</Text>
        <Text style={styles.itemCount}>{getItemCount(item.id)}</Text>
      </TouchableOpacity>

      {/* Three-dot button */}
      <TouchableOpacity
        ref={(ref) => (buttonRefs.current[item.id] = ref)}
        onPress={() => openMenu(item)}
        style={styles.menuButton}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>⋮</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={GlobalStyles.container}>
      <Text style={styles.header}>Folders</Text>
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id + "_" + item.name}
        renderItem={renderFolder}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Floating dropdown */}
      {menuVisible && menuFolder && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <View
            style={[
              styles.dropdownMenu,
              { top: menuPosition.y, left: menuPosition.x },
            ]}
          >
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setRenameFolder(menuFolder);
                setRenameVisible(true);
                closeMenu();
              }}
            >
              <Text style={styles.dropdownText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={ () => {
               showConfirmationDialog(
                    "Delete folder",
                    "Are you sure to delete this folder? All items inside this folder will be deleted.",
                    "Delete",
                    async () => {
                   let { success, message}=  await deleteFolder(menuFolder.id);
                   if(success)
                      loadData();
                    }
                  );
                closeMenu();
              }}
            >
              <Text style={[styles.dropdownText, { color: "red" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      )}

      <RenameFolderModal
          visible={renameVisible}
          defaultName={renameFolder?.name || ""}
          onCancel={() => setRenameVisible(false)}
          onSave={async (newName) => {
            if (renameFolder && newName.length > 0) {
              const result = await updateFolderName(renameFolder.id, newName);
              Alert.alert(result.message);
              if (result.success) {
                loadData(); 
              }
            }
            setRenameVisible(false);
          }}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
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
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    zIndex: 999,
  },
 dropdownMenu: {
  position: "absolute",
  backgroundColor: "#fff",
  borderRadius: 6,
  borderWidth: 1,
  borderColor: "#ccc",
  minWidth: 140, // set a reasonable min width
  elevation: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.2,
  shadowRadius: 5,
},

  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 16,
  },
});

export default HomeScreen;
