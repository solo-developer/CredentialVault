import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GlobalStyles } from "../styles/global";
import Item from "../types/Item";
import { addItem } from "../services/ItemService";
import Folder from "../types/Folder";
import CustomField from "../types/CustomField";
import { FOLDER_STORAGE_KEY } from "../Constants";




const AddItemScreen = ({ navigation }: any) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {

    const loadFolders = async () => {
      const storedFolders = await AsyncStorage.getItem(FOLDER_STORAGE_KEY);
      if (storedFolders) {
        const folderArr: Folder[] = JSON.parse(storedFolders);
        setFolders(folderArr);
        if (folderArr.length > 0) setSelectedFolder(folderArr[0]);
      }
    };
    loadFolders();
  }, []);

  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: "",
      value: "",
    };
    setCustomFields([...customFields, newField]);
  };

  const handleCustomFieldChange = (id: string, key: "label" | "value", text: string) => {
    setCustomFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: text } : field
      )
    );
  };

  const saveItem = async () => {
    if (!selectedFolder) {
      Alert.alert("Please select a folder");
      return;
    }
    if (!name) {
      Alert.alert("Please enter item name");
      return;
    }

    const newItem : Item = {
      id: Date.now().toString(),
      folderId: selectedFolder.id,
      name,
      username,
      password,
      url,
      customFields,
    };
     await addItem(newItem);

    Alert.alert("Item saved!");
    navigation.navigate("Dashboard", {
      screen: "Home",
      params: { refresh: Date.now() },
    });
  };

  return (
    <ScrollView contentContainerStyle={GlobalStyles.container}>
      <Text style={GlobalStyles.label}>Select Folder:</Text>
      <View style={styles.folderContainer}>
        {folders.map((folder) => (
          <TouchableOpacity
            key={folder.id}
            style={[
              styles.folderButton,
              selectedFolder?.id === folder.id && { backgroundColor: "#007bff" },
            ]}
            onPress={() => setSelectedFolder(folder)}
          >
            <Text
              style={{
                color: selectedFolder?.id === folder.id ? "#fff" : "#000",
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
      {customFields.map((field) => (
        <View key={field.id} style={styles.customFieldContainer}>
          <TextInput
            style={[GlobalStyles.inputSm, { flex: 1, marginRight: 5 }]}
            placeholder="Field Label"
            value={field.label}
            onChangeText={(text) => handleCustomFieldChange(field.id, "label", text)}
          />
          <TextInput
            style={[GlobalStyles.inputSm, { flex: 1, marginLeft: 5 }]}
            placeholder="Field Value"
            value={field.value}
            onChangeText={(text) => handleCustomFieldChange(field.id, "value", text)}
          />
        </View>
      ))}

      <TouchableOpacity style={GlobalStyles.btnSuccess} onPress={addCustomField}>
        <Text style={{ color: "#fff" }}>Add Custom Field</Text>
      </TouchableOpacity>

      <TouchableOpacity style={GlobalStyles.btnPrimary} onPress={saveItem}>
        <Text style={{ color: "#fff" }}>Save Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
 
  folderContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  folderButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#eee",
    marginRight: 8,
    marginBottom: 8,
  },
  customFieldContainer: {
    flexDirection: "row",
    marginTop: 8,
  }
});

export default AddItemScreen;
