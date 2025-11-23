// screens/Dashboard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "./HomeScreen";
import SettingsScreen from "./SettingsScreen";
import { addFolder } from "../services/FolderService";
import { Alert } from "react-native";


const Tab = createBottomTabNavigator();

export default function Dashboard({ navigation }:any) {
  const [showMenu, setShowMenu] = useState(false);
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

    navigation.navigate("Dashboard", {
      screen: "Home",
      params: { refresh: Date.now() },
    });
  };
  const onAddItem = () => {
    navigation.navigate("AddItem");
  };

  return (
    <>
      <Tab.Navigator
      
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: {
              width: "33.33%",
              alignItems: "center",
              justifyContent: "center",
          }
        }}
      >
        {/* HOME */}
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

        {/* ADD BUTTON */}
        <Tab.Screen
          name="Add"
          component={Empty}
          listeners={{
            tabPress: e => e.preventDefault(),
          }}
          options={{
            tabBarIcon: () => (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowMenu(!showMenu)}
              >
                <Ionicons name="add" size={32} color="white" />
              </TouchableOpacity>
            ),
          }}
        />

        {/* SETTINGS */}
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

      {/* Floating Menu */}
      {showMenu && (
        <View style={styles.popupMenu}>
          <TouchableOpacity
            style={styles.popupBtn}
            onPress={() => {
              setShowMenu(false);
              setFolderModalVisible(true);
            }}
          >
            <Ionicons name="folder" size={22} color="white" />
            <Text style={styles.popupText}>Add Folder</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.popupBtn} onPress={onAddItem}>
            <Ionicons name="key" size={22} color="white" />
            <Text style={styles.popupText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Folder Modal */}
      <Modal visible={folderModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Create Folder</Text>
            <TextInput
              placeholder="Folder name"
              value={folderName}
              onChangeText={setFolderName}
              style={styles.input}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleAddFolder}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setFolderModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function Empty() {
  return <View />;
}

// STYLES
const styles = StyleSheet.create({
  tabBar: {
    height: 70,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 70,          // prevents horizontal overflow
  },
  iconContainer: { alignItems: "center", minWidth: "100%" },
  iconText: { 
    fontSize: 11,
    marginTop: 2,
    textAlign: "center",
    includeFontPadding: false,
    numberOfLines: 1,
    lineHeight: 12,
    height: 14
  },

  addButton: {
    width: 62,
    height: 62,
    backgroundColor: "#007bff",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    top: -10,
  },

  popupMenu: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 12,
  },
  popupBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  popupText: { color: "white", marginLeft: 8 },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  saveText: { color: "white", textAlign: "center", fontWeight: "bold" },
  cancelBtn: { padding: 10 },
  cancelText: { textAlign: "center", color: "#555" },
});
