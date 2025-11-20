import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid'; // For unique ids

const STORAGE_KEY = '@folders_data';

type Credential = { id: string; title: string; username: string; password: string };
type Folder = { id: string; name: string; credentials: Credential[] };

export default function HomeScreen() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) setFolders(JSON.parse(data));
    else {
      const defaultFolder: Folder = { id: uuidv4(), name: 'Ungrouped', credentials: [] };
      setFolders([defaultFolder]);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([defaultFolder]));
    }
  };

  const saveFolders = async (updatedFolders: Folder[]) => {
    setFolders(updatedFolders);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFolders));
  };

  const handleAddFolder = async () => {
    if (!newFolderName) return Alert.alert('Error', 'Folder name cannot be empty');
    const newFolder: Folder = { id: uuidv4(), name: newFolderName, credentials: [] };
    const updatedFolders = [...folders, newFolder];
    await saveFolders(updatedFolders);
    setNewFolderName('');
    setModalVisible(false);
  };

  const renderFolder = ({ item }: { item: Folder }) => (
    <View style={styles.folder}>
      <Text style={styles.folderTitle}>{item.name}</Text>
      {item.credentials.map(c => (
        <Text key={c.id} style={styles.credentialText}>{c.title}</Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={folders}
        keyExtractor={item => item.id}
        renderItem={renderFolder}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* Add Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={{ fontSize: 18, marginBottom: 10 }}>Add Folder</Text>
            <TextInput
              placeholder="Folder Name"
              value={newFolderName}
              onChangeText={setNewFolderName}
              style={styles.input}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddFolder}>
              <Text style={{ color: '#fff' }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: 'grey', marginTop: 10 }]} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#fff' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom tabs */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity style={styles.tabButton}><Text>Settings</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => setModalVisible(true)}><Text>Add</Text></TouchableOpacity>
        <TouchableOpacity style={styles.tabButton}><Text>Home</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  folder: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  folderTitle: { fontWeight: 'bold', fontSize: 16 },
  credentialText: { paddingLeft: 10, marginTop: 5 },
  bottomTabs: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', justifyContent: 'space-around', padding: 15, borderTopWidth: 1, borderTopColor: '#ccc', backgroundColor: '#fff' },
  tabButton: { alignItems: 'center', justifyContent: 'center' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: '#fff', borderRadius: 10 },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginBottom: 10 },
  addBtn: { backgroundColor: '#007bff', padding: 10, alignItems: 'center', borderRadius: 5 },
});
