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

interface Folder {
  id: string;
  name: string;
}

interface CustomField {
  id: string;
  label: string;
  value: string;
}

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
      const storedFolders = await AsyncStorage.getItem("folders");
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

    const storedItems = await AsyncStorage.getItem("items");
    const items = storedItems ? JSON.parse(storedItems) : [];

    const newItem = {
      id: Date.now().toString(),
      folderId: selectedFolder.id,
      name,
      username,
      password,
      url,
      customFields,
    };

    await AsyncStorage.setItem("items", JSON.stringify([...items, newItem]));
    Alert.alert("Item saved!");
    navigation.navigate("Dashboard", {
      screen: "Home",
      params: { refresh: Date.now() },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Select Folder:</Text>
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

      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Item name"
      />

      <Text style={styles.label}>Username:</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
      />

      <Text style={styles.label}>URL:</Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={setUrl}
        placeholder="https://example.com"
      />

      <Text style={styles.label}>Custom Fields:</Text>
      {customFields.map((field) => (
        <View key={field.id} style={styles.customFieldContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 5 }]}
            placeholder="Field Label"
            value={field.label}
            onChangeText={(text) => handleCustomFieldChange(field.id, "label", text)}
          />
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 5 }]}
            placeholder="Field Value"
            value={field.value}
            onChangeText={(text) => handleCustomFieldChange(field.id, "value", text)}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addCustomField}>
        <Text style={{ color: "#fff" }}>Add Custom Field</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
        <Text style={{ color: "#fff" }}>Save Item</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
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
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 12,
  },
  saveButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 20,
  },
});

export default AddItemScreen;
