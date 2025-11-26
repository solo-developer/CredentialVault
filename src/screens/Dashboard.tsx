// screens/Dashboard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./HomeScreen";
import SettingsScreen from "./SettingsScreen";
import { addFolder } from "../services/FolderService";
import { Alert } from "react-native";
import { GlobalStyles } from "../styles/global";
import useSecureScreen from "../hooks/useSecureScreen";
import SyncScreen from "./SyncScreen";

const Tab = createBottomTabNavigator();

export default function Dashboard({ navigation }: any) {
  useSecureScreen();

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
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name="home" size={26} color={focused ? "#007bff" : "#444"} />
                <Text style={[styles.iconText, focused && { color: "#007bff" }]}>Home</Text>
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Sync"
          component={SyncScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name="sync" size={26} color={focused ? "#007bff" : "#444"} />
                <Text style={[styles.iconText, focused && { color: "#007bff" }]}>Sync</Text>
              </View>
            ),
          }}
        />

        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.iconContainer}>
                <Ionicons name="settings" size={26} color={focused ? "#007bff" : "#444"} />
                <Text style={[styles.iconText, focused && { color: "#007bff" }]}>Settings</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>

      {/* Floating Plus Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setMenuVisible(!menuVisible)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Floating Menu */}
      {menuVisible && (
        <View style={styles.floatingMenu}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => { setFolderModalVisible(true); setMenuVisible(false); }}>
            <Ionicons name="folder" size={22} color="white" />
            <Text style={styles.menuText}>Add Folder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBtn} onPress={handleAddItem}>
            <Ionicons name="key" size={22} color="white" />
            <Text style={styles.menuText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Folder Modal */}
      <Modal visible={folderModalVisible} transparent animationType="slide">
        <View style={GlobalStyles.modalContainer}>
          <View style={GlobalStyles.modalBox}>
            <Text style={GlobalStyles.modalTitle}>Create Folder</Text>
            <TextInput
              placeholder="Folder name"
              value={folderName}
              onChangeText={setFolderName}
              style={GlobalStyles.inputSm}
            />
            <TouchableOpacity style={GlobalStyles.btnPrimary} onPress={handleAddFolder}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setFolderModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  iconContainer: { alignItems: "center", width:300 },
  iconText: { fontSize: 11, marginTop: 2, color: "#444" },

  floatingButton: {
    position: "absolute",
    bottom: 75,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 4,
  },

  floatingMenu: {
    position: "absolute",
    bottom: 130,
    right: 60,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  menuBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  menuText: { color: "white", marginLeft: 8 },

  saveText: { color: "white", textAlign: "center", fontWeight: "bold" },
  cancelBtn: { padding: 10 },
  cancelText: { textAlign: "center", color: "#555" },
});
