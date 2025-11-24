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
import { GlobalStyles } from "../styles/global";

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
    <View style={GlobalStyles.container}>
        <View style={GlobalStyles.navHeader}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={26} color="#333" />
                </TouchableOpacity>
        
                <Text style={GlobalStyles.navTitle}>Edit Item</Text>
                <View style={{ width: 26 }} />
              </View>

      <Text style={GlobalStyles.label}>Item Name</Text>
      <TextInput value={name} onChangeText={setName} style={GlobalStyles.inputSm} />

      <Text style={GlobalStyles.label}>Username</Text>
      <TextInput value={username} onChangeText={setUsername} style={GlobalStyles.inputSm} />

      <Text style={GlobalStyles.label}>Password</Text>
      <View style={styles.passwordRow}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[GlobalStyles.inputSm, { flex: 1 }]}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={26}
            color="#007bff"
          />
        </TouchableOpacity>
      </View>

      <Text style={GlobalStyles.label}>URL</Text>
      <TextInput value={url} onChangeText={setUrl} style={GlobalStyles.inputSm} />

      <TouchableOpacity style={GlobalStyles.btnPrimary} onPress={saveItem}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({ 
 
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
  }
});
