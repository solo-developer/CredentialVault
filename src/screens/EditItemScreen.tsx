import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles } from '../styles/global';
import Item from '../types/Item';
import { updateItem } from '../services/ItemService';
import Folder from '../types/Folder';
import CustomField from '../types/CustomField';
import { FOLDER_STORAGE_KEY } from '../Constants';
import { getFolders } from '../services/FolderService';

interface EditItemScreenProps {
  navigation: any;
  route: {
    params: {
      item: Item;
    };
  };
}

const EditItemScreen: React.FC<EditItemScreenProps> = ({
  navigation,
  route,
}) => {
  const existingItem = route.params.item;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const [name, setName] = useState(existingItem.name);
  const [username, setUsername] = useState(existingItem.username);
  const [password, setPassword] = useState(existingItem.password);
  const [url, setUrl] = useState(existingItem.url);
  const [customFields, setCustomFields] = useState<CustomField[]>(
    existingItem.customFields || [],
  );

  useEffect(() => {
    const loadFolders = async () => {
      const storedFolders = await getFolders();

      setFolders(storedFolders);

      const initialFolder = storedFolders.find(
        f => f.id === existingItem.folderId,
      );
      if (initialFolder) setSelectedFolder(initialFolder);
    };
    loadFolders();
  }, []);

  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: '',
      value: '',
    };
    setCustomFields([...customFields, newField]);
  };

  const handleCustomFieldChange = (
    id: string,
    key: 'label' | 'value',
    text: string,
  ) => {
    setCustomFields(prev =>
      prev.map(field => (field.id === id ? { ...field, [key]: text } : field)),
    );
  };

  const saveChanges = async () => {
    if (!selectedFolder) {
      Alert.alert('Please select a folder');
      return;
    }
    if (!name) {
      Alert.alert('Please enter item name');
      return;
    }

    const updatedItem: Item = {
      ...existingItem,
      folderId: selectedFolder.id,
      name,
      username,
      password,
      url,
      customFields,
    };

    await updateItem(updatedItem);

    Alert.alert('Item updated!');
    navigation.navigate('Dashboard', {
      screen: 'Home',
      params: { refresh: Date.now() },
    });
  };

  return (
    <ScrollView contentContainerStyle={GlobalStyles.container}>
      <Text style={GlobalStyles.label}>Select Folder:</Text>
      <View style={styles.folderContainer}>
        {folders.map(folder => (
          <TouchableOpacity
            key={folder.id}
            style={[
              styles.folderButton,
              selectedFolder?.id === folder.id && {
                backgroundColor: '#007bff',
              },
            ]}
            onPress={() => setSelectedFolder(folder)}
          >
            <Text
              style={{
                color: selectedFolder?.id === folder.id ? '#fff' : '#000',
              }}
            >
              {folder.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={GlobalStyles.label}>Name:</Text>
      <TextInput
        style={GlobalStyles.inputMd}
        value={name}
        onChangeText={setName}
        placeholder="Item name"
      />

      <Text style={GlobalStyles.label}>Username:</Text>
      <TextInput
        style={GlobalStyles.inputSm}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />

      <Text style={GlobalStyles.label}>Password:</Text>
      <TextInput
        style={GlobalStyles.inputSm}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <Text style={GlobalStyles.label}>URL:</Text>
      <TextInput
        style={GlobalStyles.inputSm}
        value={url}
        onChangeText={setUrl}
        placeholder="https://example.com"
      />

      <Text style={GlobalStyles.label}>Custom Fields:</Text>
      {customFields.map(field => (
        <View key={field.id} style={styles.customFieldContainer}>
          <TextInput
            style={[GlobalStyles.inputSm, { flex: 1, marginRight: 5 }]}
            placeholder="Field Label"
            value={field.label}
            onChangeText={text =>
              handleCustomFieldChange(field.id, 'label', text)
            }
          />
          <TextInput
            style={[GlobalStyles.inputSm, { flex: 1, marginLeft: 5 }]}
            placeholder="Field Value"
            value={field.value}
            onChangeText={text =>
              handleCustomFieldChange(field.id, 'value', text)
            }
          />
        </View>
      ))}

      <TouchableOpacity
        style={GlobalStyles.btnSuccess}
        onPress={addCustomField}
      >
        <Text style={{ color: '#fff' }}>Add Custom Field</Text>
      </TouchableOpacity>

      <TouchableOpacity style={GlobalStyles.btnPrimary} onPress={saveChanges}>
        <Text style={{ color: '#fff' }}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  folderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  folderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eee',
    marginRight: 8,
    marginBottom: 8,
  },
  customFieldContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default EditItemScreen;
