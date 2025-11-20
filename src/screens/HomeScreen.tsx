import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

type Folder = {
  id: string;
  name: string;
};

export default function HomeScreen() {
  const [folders, setFolders] = useState<Folder[]>([
    { id: '1', name: 'Ungrouped' },
  ]);

  // TODO: Load folders from AsyncStorage on mount
  useEffect(() => {
    // Example: loadFolders();
  }, []);

  const renderFolder = ({ item }: { item: Folder }) => (
    <TouchableOpacity style={styles.folderItem}>
      <Text style={styles.folderText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Folders</Text>
      <FlatList
        data={folders}
        renderItem={renderFolder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  folderItem: {
    padding: 16,
    marginVertical: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  folderText: { fontSize: 16 },
});
