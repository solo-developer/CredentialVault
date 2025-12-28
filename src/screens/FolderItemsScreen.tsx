import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme, AppColors } from "../styles/global";
import SecondaryHeader from "../components/SecondaryHeader";

import Item from "../types/Item";

const FolderItemsScreen = ({ route }: any) => {
  const { colors, styles: themeStyles } = useAppTheme();
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

  const renderItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[themeStyles.card, styles.itemCard, { borderColor: colors.border }]}
      onPress={() => navigation.navigate("ViewItem", { item })}
      activeOpacity={0.7}
    >
      <View style={[styles.itemIconContainer, { backgroundColor: item.type === 'note' ? `${colors.secondary}15` : `${colors.warning}15` }]}>
        <Ionicons
          name={item.type === 'note' ? "document-text" : "key"}
          size={24}
          color={item.type === 'note' ? colors.secondary : colors.warning}
        />
      </View>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.itemUsername, { color: colors.textMuted }]} numberOfLines={1}>
          {item.type === 'note' ? 'Secure Note' : (item.username || 'No username')}
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate("EditItem", { item })}
        >
          <Ionicons name="pencil-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SecondaryHeader
        title={folderName}
        onBack={() => navigation.goBack()}
      />

      <View style={[themeStyles.screenContainer, { paddingTop: 16 }]}>
        {items.length === 0 ? (
          <View style={themeStyles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: `${colors.border}40` }]}>
              <Ionicons name="key-outline" size={60} color={colors.textLight} />
            </View>
            <Text style={themeStyles.emptyText}>This folder is empty.</Text>
            <TouchableOpacity
              style={[themeStyles.button, { paddingHorizontal: 30, marginTop: 24 }]}
              onPress={() => navigation.navigate("AddItem")}
            >
              <Text style={themeStyles.buttonText}>Add First Item</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemUsername: {
    fontSize: 13,
    fontWeight: '500',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  }
});

export default FolderItemsScreen;
