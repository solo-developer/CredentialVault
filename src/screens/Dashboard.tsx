import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

export default function Dashboard() {
  const [addModalVisible, setAddModalVisible] = useState(false);

  const openAddModal = () => setAddModalVisible(true);
  const closeAddModal = () => setAddModalVisible(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Home') return <Ionicons name="home-outline" size={size} color={color} />;
            if (route.name === 'Settings') return <Ionicons name="settings-outline" size={size} color={color} />;
            return null;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>

      {/* Floating Add Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
          onLongPress={openAddModal} // long press opens modal
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal for Add Folder / Add Item */}
      <Modal transparent visible={addModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalButton} onPress={() => { /* Add Folder Logic */ }}>
              <Text style={styles.modalText}>Add Folder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => { /* Add Item Logic */ }}>
              <Text style={styles.modalText}>Add Item</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, { backgroundColor: '#ccc' }]} onPress={closeAddModal}>
              <Text style={styles.modalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 250,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalButton: {
    padding: 12,
    marginVertical: 5,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  modalText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
