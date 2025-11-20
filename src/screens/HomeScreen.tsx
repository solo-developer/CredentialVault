import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Folder = {
  id: string;
  name: string;
};

export default function HomeScreen() {
  const [folders, setFolders] = useState<Folder[]>([]);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const storedFolders = await AsyncStorage.getItem('folders');
      let parsedFolders: Folder[] = storedFolders ? JSON.parse(storedFolders) : [];

      // Check if "Ungrouped" exists
      const ungroupedExists = parsedFolders.some(f => f.name === 'Ungrouped');
      if (!ungroupedExists) {
        const defaultFolder: Folder = { id: Date.now().toString(), name: 'Ungrouped' };
        parsedFolders.push(defaultFolder);
        await AsyncStorage.setItem('folders', JSON.stringify(parsedFolders));
      }
      setFolders(parsedFolders);
    } catch (e) {
      console.error('Failed to load folders', e);
    }
  };

  const renderFolder = ({ item }: { item: Folder }) => (
    <View style={styles.folderContainer}>
      <Text style={styles.folderName}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Folders</Text>
      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        renderItem={renderFolder}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  folderContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  folderName: { fontSize: 16 },
});
