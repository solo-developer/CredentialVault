import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'react-native-bcrypt';
import { SaveUserInfo } from '../services/AuthenticationService';
import { CommonActions } from '@react-navigation/native';
import { GlobalStyles, AppColors } from '../styles/global';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ChangeLoginInformationScreen({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (
      !username.trim() ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      Alert.alert('Incomplete Fields', 'Please fill in all fields to proceed.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const storedUsername = await AsyncStorage.getItem('@username');
      const storedHashedPassword = await AsyncStorage.getItem(
        '@master_password',
      );

      if (username.trim() !== storedUsername || !storedHashedPassword) {
        setLoading(false);
        Alert.alert('Invalid User', 'The username provided does not match our records.');
        return;
      }

      const match = bcrypt.compareSync(currentPassword, storedHashedPassword);
      if (!match) {
        setLoading(false);
        Alert.alert('Verification Failed', 'Current master password is incorrect.');
        return;
      }

      await SaveUserInfo(username.trim(), newPassword);

      setLoading(false);

      Alert.alert('Success', 'Security credentials updated! Please sign in with your new password.', [
        {
          text: 'Proceed to Login',
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
      Alert.alert('Update Failed', 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={GlobalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={AppColors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security Update</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hintBox}>
          <Ionicons name="shield-outline" size={20} color={AppColors.primary} />
          <Text style={styles.hintText}>To update your master password, please verify your current credentials first.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={GlobalStyles.label}>Registered Username</Text>
          <TextInput
            style={GlobalStyles.inputMd}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor={AppColors.textLight}
            autoCapitalize="none"
          />

          <View style={styles.divider} />

          <Text style={GlobalStyles.label}>Current Master Password</Text>
          <TextInput
            style={GlobalStyles.inputMd}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Verify current password"
            placeholderTextColor={AppColors.textLight}
            secureTextEntry
          />

          <View style={styles.divider} />

          <Text style={GlobalStyles.label}>New Master Password</Text>
          <TextInput
            style={GlobalStyles.inputMd}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Set new password"
            placeholderTextColor={AppColors.textLight}
            secureTextEntry
          />

          <Text style={[GlobalStyles.label, { marginTop: 16 }]}>Confirm New Password</Text>
          <TextInput
            style={GlobalStyles.inputMd}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat new password"
            placeholderTextColor={AppColors.textLight}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[GlobalStyles.button, { marginTop: 32 }]}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={GlobalStyles.buttonText}>Update Credentials</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.warningText}>
          Warning: Make sure you remember your new master password. If lost, your data cannot be recovered.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textMain,
    letterSpacing: -0.5,
  },
  hintBox: {
    flexDirection: 'row',
    backgroundColor: `${AppColors.primary}08`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 13,
    color: AppColors.textMuted,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: AppColors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 20,
  },
  warningText: {
    fontSize: 12,
    color: AppColors.danger,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  }
});
