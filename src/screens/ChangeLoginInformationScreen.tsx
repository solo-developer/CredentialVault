import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'react-native-bcrypt';
import { SaveUserInfo } from '../services/AuthenticationService';
import { CommonActions } from '@react-navigation/native';

export default function ChangeLoginInformationScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdate = async () => {
    if (
      !username.trim() ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const storedUsername = await AsyncStorage.getItem('@username');
    const storedHashedPassword = await AsyncStorage.getItem('@master_password');

    // Verify current password
    if (username.trim() !== storedUsername || !storedHashedPassword) {
      Alert.alert('Error', 'Invalid username or password');
      return;
    }

    const match = bcrypt.compareSync(currentPassword, storedHashedPassword);
    if (!match) {
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    await SaveUserInfo(username.trim(), newPassword);

    Alert.alert('Success', 'Login information updated! Please login again.', [
      {
        text: 'OK',
        onPress: () => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MasterPasswordSetup' }], 
            }),
          );
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Username:</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />

      <Text style={styles.label}>Current Password:</Text>
      <TextInput
        style={styles.input}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current Password"
        secureTextEntry
      />

      <Text style={styles.label}>New Password:</Text>
      <TextInput
        style={styles.input}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
        secureTextEntry
      />

      <Text style={styles.label}>Confirm New Password:</Text>
      <TextInput
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
        <Text style={styles.btnText}>Update</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontSize: 16, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  btn: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
