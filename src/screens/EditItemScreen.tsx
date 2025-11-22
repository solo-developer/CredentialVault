// EditItemScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function EditItemScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const [name, setName] = useState(item.name);
  const [username, setUsername] = useState(item.username);
  const [password, setPassword] = useState(item.password);
  const [showPassword, setShowPassword] = useState(false);
  const [url, setUrl] = useState(item.url || "");

  const saveItem = () => {
    Alert.alert("Updated!", "Item has been updated.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Item Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} />

      <Text style={styles.label}>Username</Text>
      <TextInput value={username} onChangeText={setUsername} style={styles.input} />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.input, { flex: 1 }]}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={26}
            color="#007bff"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>URL</Text>
      <TextInput value={url} onChangeText={setUrl} style={styles.input} />

      <TouchableOpacity style={styles.saveBtn} onPress={saveItem}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 14, fontSize: 14, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  }
});
