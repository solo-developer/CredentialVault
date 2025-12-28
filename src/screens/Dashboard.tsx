// screens/Dashboard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Pressable, Dimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import HomeScreen from "./HomeScreen";
import SettingsScreen from "./SettingsScreen";
import { addFolder } from "../services/FolderService";
import { Alert } from "react-native";
import { GlobalStyles, useAppTheme } from "../styles/global";
import useSecureScreen from "../hooks/useSecureScreen";
import SyncScreen from "./SyncScreen";
import NavHeader from "../components/NavHeader";
import { useBackHandlerExitApp } from "../hooks/useBackHandlerExitApp";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createMaterialTopTabNavigator();

export default function Dashboard({ navigation }: any) {
  const { colors, styles: themeStyles } = useAppTheme();
  const insets = useSafeAreaInsets();
  useSecureScreen();
  useBackHandlerExitApp();

  const [menuVisible, setMenuVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleAddFolder = async () => {
    if (!folderName.trim()) {
      Alert.alert("Folder name cannot be empty");
      return;
    }

    const result = await addFolder(folderName.trim());
    if (!result.success) {
      Alert.alert(result.message);
      return;
    }

    setFolderModalVisible(false);
    setFolderName("");
    navigation.navigate("Dashboard", { screen: "Home", params: { refresh: Date.now() } });
  };

  const handleAddItem = () => {
    navigation.navigate("AddItem");
    setMenuVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <NavHeader navigation={navigation}></NavHeader>

      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIndicatorStyle: {
            backgroundColor: colors.primary,
            top: 0,
            height: 3,
            borderRadius: 3,
          },
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            elevation: 0,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom,
          },
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarItemStyle: { height: 60 },
          tabBarIcon: ({ color, focused }) => {
            let iconName = "";
            if (route.name === 'Home') iconName = focused ? "grid" : "grid-outline";
            else if (route.name === 'Sync') iconName = focused ? "sync" : "sync-outline";
            else if (route.name === 'Settings') iconName = focused ? "settings" : "settings-outline";

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: "Vault" }}
        />
        <Tab.Screen
          name="Sync"
          component={SyncScreen}
          options={{ tabBarLabel: "Sync" }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ tabBarLabel: "Settings" }}
        />
      </Tab.Navigator>

      {/* Floating Plus Button - Adjusted bottom for Top Tab compatibility */}
      <TouchableOpacity
        style={[themeStyles.floatingButton, { bottom: 85 + insets.bottom }]}
        onPress={() => setMenuVisible(!menuVisible)}
        activeOpacity={0.8}
      >
        <Ionicons name={menuVisible ? "close" : "add"} size={32} color="white" />
      </TouchableOpacity>

      {/* Floating Menu Backdrop */}
      {menuVisible && (
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuVisible(false)}
        />
      )}

      {/* Floating Menu */}
      {menuVisible && (
        <View style={[themeStyles.floatingMenu, { bottom: 160 + insets.bottom }]}>
          <TouchableOpacity
            style={themeStyles.menuBtn}
            onPress={() => { setFolderModalVisible(true); setMenuVisible(false); }}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.primary}15` }]}>
              <Ionicons name="folder-outline" size={20} color={colors.primary} />
            </View>
            <Text style={themeStyles.menuText}>Add Folder</Text>
          </TouchableOpacity>

          <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={themeStyles.menuBtn}
            onPress={handleAddItem}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${colors.warning}15` }]}>
              <Ionicons name="key-outline" size={20} color={colors.warning} />
            </View>
            <Text style={themeStyles.menuText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Folder Modal */}
      <Modal visible={folderModalVisible} transparent animationType="fade">
        <View style={themeStyles.modalContainer}>
          <View style={themeStyles.modalBox}>
            <Text style={themeStyles.title}>New Folder</Text>
            <TextInput
              placeholder="e.g. Social Media, Banking"
              placeholderTextColor={colors.textLight}
              value={folderName}
              onChangeText={setFolderName}
              style={[themeStyles.inputMd, { marginTop: 0 }]}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setFolderModalVisible(false)}
              >
                <Text style={[styles.cancelText, { color: colors.textMuted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[themeStyles.button, { marginTop: 0, flex: 1, marginLeft: 12 }]}
                onPress={handleAddFolder}
              >
                <Text style={styles.saveText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'none',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  saveText: { color: "white", textAlign: "center", fontWeight: "700", fontSize: 16 },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  cancelText: { textAlign: "center", fontWeight: '600', fontSize: 16 },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
});
