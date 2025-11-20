import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function Dashboard() {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const handleAddLongPress = () => setShowAddMenu(true);
  const closeAddMenu = () => setShowAddMenu(false);

  const handleAddFolder = () => {
    closeAddMenu();
    // open folder modal
  };

  const handleAddItem = () => {
    closeAddMenu();
    // open item modal
  };

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => (
          <View style={styles.tabBar}>
            {/* Home Tab */}
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => props.navigation.navigate('Home')}
            >
              <Ionicons name="home-outline" size={25} color="#333" />
              <Text>Home</Text>
            </TouchableOpacity>

            {/* Add Button in center */}
            <TouchableOpacity
              style={styles.addButton}
              onLongPress={handleAddLongPress}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Settings Tab */}
            <TouchableOpacity
              style={styles.tabButton}
              onPress={() => props.navigation.navigate('Settings')}
            >
              <Ionicons name="settings-outline" size={25} color="#333" />
              <Text>Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>

      {/* Add Menu Modal */}
      <Modal transparent visible={showAddMenu} animationType="fade">
        <TouchableOpacity style={styles.modalBackground} onPress={closeAddMenu}>
          <View style={styles.addMenu}>
            <TouchableOpacity style={styles.menuButton} onPress={handleAddFolder}>
              <Text style={styles.menuText}>Add Folder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuButton} onPress={handleAddItem}>
              <Text style={styles.menuText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 70,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
  },
  addButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMenu: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: 200,
  },
  menuButton: {
    paddingVertical: 10,
  },
  menuText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
