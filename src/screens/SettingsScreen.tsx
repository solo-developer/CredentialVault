import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

import { loginToOneDrive, uploadBackup, downloadBackup } from "../services/OnedriveService";
import { createBackupJSON, restoreBackupJSON } from "../services/LocalBackupService";

export default function SettingsScreen() {

  const handleConnect = async () => {
    try {
      await loginToOneDrive();
      Alert.alert("Connected", "Your OneDrive account is linked.");
    } catch(ex : any) {
      Alert.alert("Error", ex.message);
    }
  };

  const handleBackupUpload = async () => {
    try {
      const data = await createBackupJSON();
      await uploadBackup(data);

      Alert.alert("Success", "Backup uploaded to OneDrive.");
    } catch (e) {
      Alert.alert("Error", String(e));
    }
  };

  const handleBackupDownload = async () => {
    try {
      const data = await downloadBackup();
      await restoreBackupJSON(data);

      Alert.alert("Success", "Backup restored from OneDrive.");
    } catch (e) {
      Alert.alert("Error", String(e));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={handleConnect}>
        <Text style={styles.buttonText}>Connect OneDrive</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleBackupUpload}>
        <Text style={styles.buttonText}>Upload Backup</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleBackupDownload}>
        <Text style={styles.buttonText}>Download Backup</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  button: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#007bff",
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
