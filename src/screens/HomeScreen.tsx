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
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Item from "../types/Item";
import Folder from "../types/Folder";
import { useAppTheme, AppColors } from "../styles/global";
import { showConfirmationDialog } from "../components/ConfirmationDialog";
import { deleteFolder, updateFolderName } from "../services/FolderService";
import RenameFolderModal from "./RenameFolderModel";
import { calculateStrength } from "../utils/PasswordUtils";

const HomeScreen = ({ navigation }: any) => {
  const { colors, styles: themeStyles } = useAppTheme();
  const route = useRoute<any>();
  const [renameVisible, setRenameVisible] = useState(false);
  const [renameFolder, setRenameFolder] = useState<Folder | null>(null);

  const [folders, setFolders] = useState<Folder[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuFolder, setMenuFolder] = useState<Folder | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const buttonRefs = useRef<{ [key: string]: any }>({});

  const [searchQuery, setSearchQuery] = useState("");
  const [auditData, setAuditData] = useState({ weak: 0, total: 0 });

  const loadData = async () => {
    const storedFoldersStr = await AsyncStorage.getItem("folders");
    const storedItemsStr = await AsyncStorage.getItem("items");

    const storedFolders = storedFoldersStr ? JSON.parse(storedFoldersStr) : [];
    const storedItems: Item[] = storedItemsStr ? JSON.parse(storedItemsStr) : [];

    setFolders(storedFolders);
    setItems(storedItems);

    const weakCount = storedItems.filter(i => i.type === 'credential' && calculateStrength(i.password || "").score <= 2).length;
    setAuditData({ weak: weakCount, total: storedItems.filter(i => i.type === 'credential').length });
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

  const openMenu = (folder: Folder) => {
    const buttonRef = buttonRefs.current[folder.id];
    if (buttonRef) {
      buttonRef.measure(
        (fx: number, fy: number, width: number, height: number, px: number, py: number) => {
          const screenWidth = Dimensions.get("window").width;
          const dropdownWidth = 160;
          let left = px;

          if (px + dropdownWidth > screenWidth - 20) {
            left = screenWidth - dropdownWidth - 20;
          }

          setMenuPosition({ x: left, y: py + height + 5 });
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

  const renderFolder = ({ item }: { item: Folder }) => {
    const count = getItemCount(item.id);
    return (
      <View style={[themeStyles.card, styles.folderCard, { borderColor: colors.border }]}>
        <TouchableOpacity
          style={styles.folderContent}
          onPress={() => {
            navigation.navigate("FolderItems", {
              folderId: item.id,
              folderName: item.name,
            });
          }}
          activeOpacity={0.6}
        >
          <View style={[styles.folderIconContainer, { backgroundColor: `${colors.primary}10` }]}>
            <Ionicons name="folder" size={28} color={colors.primary} />
          </View>
          <View style={styles.folderInfo}>
            <Text style={[styles.folderName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.itemCount, { color: colors.textMuted }]}>{count} items</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          ref={(ref) => { buttonRefs.current[item.id] = ref; }}
          onPress={() => openMenu(item)}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderItemResult = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[themeStyles.card, styles.folderCard, { borderColor: colors.border }]}
      onPress={() => navigation.navigate("ViewItem", { item })}
      activeOpacity={0.7}
    >
      <View style={[styles.folderIconContainer, { backgroundColor: item.type === 'note' ? `${colors.secondary}15` : `${colors.warning}15` }]}>
        <Ionicons name={item.type === 'note' ? "document-text" : "key"} size={24} color={item.type === 'note' ? colors.secondary : colors.warning} />
      </View>
      <View style={styles.folderInfo}>
        <Text style={[styles.folderName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemCount, { color: colors.textMuted }]}>
          {item.type === 'note' ? 'Secure Note' : (item.username || 'No username')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </TouchableOpacity>
  );

  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.username && i.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (i.url && i.url.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const searchData = [
    ...(filteredFolders.length > 0 ? [{ type: 'header', title: 'Folders', id: 'h-folders' } as any, ...filteredFolders] : []),
    ...(filteredItems.length > 0 ? [{ type: 'header', title: 'Items', id: 'h-items' } as any, ...filteredItems] : [])
  ];

  return (
    <View style={themeStyles.container}>
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={20} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.textMain }]}
          placeholder="Search folders or items..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length > 0 ? (
        <FlatList
          data={searchData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return <Text style={[styles.sectionHeader, { color: colors.textMain, marginTop: 12 }]}>{item.title}</Text>;
            }
            return item.folderId !== undefined ? renderItemResult({ item }) : renderFolder({ item });
          }}
          ListEmptyComponent={
            <View style={themeStyles.emptyContainer}>
              <Ionicons name="search-outline" size={60} color={colors.textLight} />
              <Text style={themeStyles.emptyText}>No matching folders or items found.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <>
          {auditData.weak > 0 && (
            <TouchableOpacity
              style={[styles.auditCard, { backgroundColor: `${colors.danger}08`, borderColor: `${colors.danger}20` }]}
              onPress={() => Alert.alert("Security Audit", `${auditData.weak} of your ${auditData.total} passwords are weak. We recommend updating them for better security.`)}
            >
              <View style={[styles.auditIconContainer, { backgroundColor: `${colors.danger}15` }]}>
                <Ionicons name="shield-alert" size={24} color={colors.danger} />
              </View>
              <View style={styles.auditInfo}>
                <Text style={[styles.auditTitle, { color: colors.textMain }]}>Security Audit</Text>
                <Text style={[styles.auditText, { color: colors.textMuted }]}>{auditData.weak} weak passwords detected</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}

          <Text style={themeStyles.subtitle}>Folders</Text>
          {folders.length === 0 ? (
            <View style={themeStyles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.border + '40' }]}>
                <Ionicons name="folder-open-outline" size={60} color={colors.textLight} />
              </View>
              <Text style={themeStyles.emptyText}>
                No folders yet. Start by creating your first folder!
              </Text>
            </View>
          ) : (
            <FlatList
              data={folders}
              keyExtractor={(item) => item.id + "_" + item.name}
              renderItem={renderFolder}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}

      {/* Floating dropdown overlay */}
      {menuVisible && menuFolder && (
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <View
            style={[
              styles.dropdownMenu,
              { top: menuPosition.y, left: menuPosition.x, backgroundColor: colors.surface, borderColor: colors.border },
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
              <Ionicons name="pencil-outline" size={18} color={colors.textMain} style={styles.dropdownIcon} />
              <Text style={[styles.dropdownText, { color: colors.textMain }]}>Rename</Text>
            </TouchableOpacity>

            <View style={[styles.dropdownDivider, { backgroundColor: colors.border }]} />

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                showConfirmationDialog(
                  "Delete folder",
                  "Are you sure to delete this folder? All items inside this folder will be deleted.",
                  "Delete",
                  async () => {
                    let { success, message } = await deleteFolder(menuFolder!.id);
                    if (success) loadData();
                  }
                );
                closeMenu();
              }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} style={styles.dropdownIcon} />
              <Text style={[styles.dropdownText, { color: colors.danger }]}>
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
            if (result.success) {
              loadData();
            } else {
              Alert.alert(result.message);
            }
          }
          setRenameVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  folderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
  },
  folderContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  folderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  itemCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
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
    borderRadius: 12,
    padding: 4,
    minWidth: 150,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdownDivider: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 20,
    borderWidth: 1,
    height: 48,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  auditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
  },
  auditIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  auditInfo: {
    flex: 1,
  },
  auditTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  auditText: {
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  }
});

export default HomeScreen;
