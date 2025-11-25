import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'react-native-bcrypt';
import { SaveUserInfo } from '../services/AuthenticationService';
import { CommonActions } from '@react-navigation/native';
import { GlobalStyles } from '../styles/global';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ChangeLoginInformationScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false); // loader state

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

    try {
      setLoading(true); // start loader

      const storedUsername = await AsyncStorage.getItem('@username');
      const storedHashedPassword = await AsyncStorage.getItem(
        '@master_password',
      );

      // Verify current password
      if (username.trim() !== storedUsername || !storedHashedPassword) {
        setLoading(false);
        Alert.alert('Error', 'Invalid username or password');
        return;
      }

      const match = bcrypt.compareSync(currentPassword, storedHashedPassword);
      if (!match) {
        setLoading(false);
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }

      // Hash new password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      await SaveUserInfo(username.trim(), newPassword);

      setLoading(false);

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
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <View style={GlobalStyles.navHeaderSm}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={GlobalStyles.title}>Change Login Information</Text>
        <View style={{ width: 26 }} />
      </View>
      <Text style={styles.label}>Username:</Text>
      <TextInput
        style={GlobalStyles.inputSm}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
      />

      <Text style={styles.label}>Current Password:</Text>
      <TextInput
        style={GlobalStyles.inputSm}
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current Password"
        secureTextEntry
      />

      <Text style={styles.label}>New Password:</Text>
      <TextInput
        style={GlobalStyles.inputSm}
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New Password"
        secureTextEntry
      />

      <Text style={styles.label}>Confirm New Password:</Text>
      <TextInput
        style={GlobalStyles.inputSm}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirm Password"
        secureTextEntry
      />

      <TouchableOpacity
        style={GlobalStyles.btnPrimary}
        onPress={handleUpdate}
        disabled={loading} // disable button while loading
      >
        {loading ? (
         <View style={GlobalStyles.loadingContainer}> <ActivityIndicator color="#fff" /><Text style={styles.btnText}> Updating...</Text></View> 
        ) : (
          <Text style={styles.btnText}>Update</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, marginVertical: 8 },

  btnText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
  
});
