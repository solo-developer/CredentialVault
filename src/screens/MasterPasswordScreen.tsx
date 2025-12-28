import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Image,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles, AppColors } from '../styles/global';
import { MASTER_PASSWORD_KEY, MASTER_USERNAME_KEY } from '../Constants';
import { SaveUserInfo, verifyUser } from '../services/AuthenticationService';
import ReactNativeBiometrics from 'react-native-biometrics';
import { useBackHandlerExitApp } from '../hooks/useBackHandlerExitApp';

const MasterPasswordSetup: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  useBackHandlerExitApp();
  useEffect(() => {
    const checkFirstLaunch = async () => {
      const storedPassword = await AsyncStorage.getItem(MASTER_PASSWORD_KEY);
      const storedUsername = await AsyncStorage.getItem(MASTER_USERNAME_KEY);

      if (!storedPassword || !storedUsername) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
        setUsername(storedUsername || '');
      }
    };
    checkFirstLaunch();
  }, []);

  // Load biometric preference if login screen
  useEffect(() => {
    const loadBiometricPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('@use_biometric_login');
        setBiometricEnabled(saved === 'true');
      } catch (error) {
        console.log('Failed to load biometric preference', error);
      }
    };
    if (isFirstLaunch === false) loadBiometricPreference();
  }, [isFirstLaunch]);

  const handleSetup = async () => {
    if (!username.trim() || !password || !confirmPassword) {
      Alert.alert('Incomplete Fields', 'Please fill in all the required information.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'The passwords you entered do not match.');
      return;
    }
    setLoading(true);
    await SaveUserInfo(username, password);
    setLoading(false);
    navigation.replace('Dashboard');
  };

  const handleLogin = async () => {
    if (!password) {
      Alert.alert('Password Required', 'Please enter your master password.');
      return;
    }
    setLoading(true);
    let isUserValid = await verifyUser(username, password);
    setLoading(false);
    if (isUserValid) {
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Access Denied', 'The password you entered is incorrect.');
    }
  };

  const handleBiometricLogin = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    try {
      const result = await rnBiometrics.simplePrompt({
        promptMessage: 'Unlock Credential Vault',
      });
      if (result.success) {
        navigation.replace('Dashboard');
      }
    } catch (error: any) {
      console.log('Biometric error', error);
    }
  };

  if (isFirstLaunch === null) return (
    <View style={[styles.container, { justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={AppColors.primary} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={60} color={AppColors.primary} />
            </View>
          </View>
          <Text style={styles.title}>
            {isFirstLaunch ? 'Create Vault' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtext}>
            {isFirstLaunch
              ? 'Securely store your passwords on your device'
              : `Hello ${username}, please authenticate to continue`}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {isFirstLaunch && (
            <TextInput
              placeholder="Preferred Username"
              placeholderTextColor={AppColors.textLight}
              style={GlobalStyles.inputMd}
              value={username}
              onChangeText={setUsername}
              autoFocus={true}
            />
          )}

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Master Password"
              placeholderTextColor={AppColors.textLight}
              style={[GlobalStyles.inputMd, { paddingRight: 50 }]}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoFocus={!isFirstLaunch}
            />
            <TouchableOpacity
              style={styles.eyeIconBtn}
              onPress={() => setShowPassword(prev => !prev)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={AppColors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {isFirstLaunch && (
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Confirm Master Password"
                placeholderTextColor={AppColors.textLight}
                style={[GlobalStyles.inputMd, { paddingRight: 50 }]}
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setShowConfirmPassword(prev => !prev)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={AppColors.textMuted}
                />
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[GlobalStyles.button, { marginTop: 10 }]}
            onPress={isFirstLaunch ? handleSetup : handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={GlobalStyles.buttonText}>
                {isFirstLaunch ? 'Setup Vault' : 'Unlock Now'}
              </Text>
            )}
          </TouchableOpacity>

          {!isFirstLaunch && biometricEnabled && (
            <TouchableOpacity
              style={styles.biometricBtn}
              onPress={handleBiometricLogin}
            >
              <Ionicons name="finger-print" size={32} color={AppColors.primary} />
              <Text style={styles.biometricLabel}>Or use biometric unlock</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ by</Text>
          <Text style={styles.footerAuthor}>solo-developer</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default MasterPasswordSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 30,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${AppColors.primary}08`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: `${AppColors.primary}15`,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: AppColors.textMain,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: 14,
    color: AppColors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    gap: 16,
    flex: 1,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center'
  },
  eyeIconBtn: {
    position: 'absolute',
    right: 14,
    padding: 8,
  },
  biometricBtn: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricLabel: {
    marginTop: 8,
    fontSize: 14,
    color: AppColors.primary,
    fontWeight: '600',
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: AppColors.textLight,
    marginBottom: 4,
  },
  footerAuthor: {
    fontSize: 14,
    fontWeight: '800',
    color: AppColors.textMuted,
    letterSpacing: 1,
  },
});
