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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../styles/global';
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
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    await SaveUserInfo(username, password);
    setLoading(false);
    navigation.replace('Dashboard');
  };

  const handleLogin = async () => {
    setLoading(true);
    let isUserValid = await verifyUser(username, password);
    setLoading(false);
    if (isUserValid) {
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Error', 'Invalid username or password');
    }
  };

  const handleBiometricLogin = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    try {
      const result = await rnBiometrics.simplePrompt({
        promptMessage: 'Authenticate',
      });
      if (result.success) {
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Authentication failed');
      }
    } catch (error: any) {
      console.log('Biometric error', error);
      Alert.alert('Authentication failed', error.message);
    }
  };

  if (isFirstLaunch === null) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Image source={require('../assets/icon.png')} style={styles.logo} />

      <Text style={styles.title}>
        {isFirstLaunch ? 'Setup Master Password' : 'Welcome Back'}
      </Text>
      <Text style={styles.subtext}>
        Please enter the details below to continue
      </Text>

      <View style={styles.formContainer}>
        <TextInput
          placeholder="Username"
          style={GlobalStyles.inputMd}
          value={username}
          onChangeText={setUsername}
        />

        <View style={styles.inputWrapper}>
          <TextInput
            placeholder="Master Password"
            style={[GlobalStyles.inputMd, { paddingRight: 40 }]}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={GlobalStyles.eyeIcon}
            onPress={() => setShowPassword(prev => !prev)}
          >
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {isFirstLaunch && (
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Confirm Password"
              style={[GlobalStyles.inputMd, { paddingRight: 40 }]}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              style={GlobalStyles.eyeIcon}
              onPress={() => setShowConfirmPassword(prev => !prev)}
            >
              <Icon
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={22}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={GlobalStyles.btnPrimary}
          onPress={isFirstLaunch ? handleSetup : handleLogin}
          disabled={loading}
        >
          {loading ? (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator color="#fff" />
              <Text style={[GlobalStyles.buttonText, { marginLeft: 10 }]}>
                {isFirstLaunch ? 'Signing up...' : 'Logging in...'}
              </Text>
            </View>
          ) : (
            <Text style={GlobalStyles.buttonText}>
              {isFirstLaunch ? 'Sign Up' : 'Login'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Biometric Login Option */}
        {!isFirstLaunch && biometricEnabled && (
          <>
            <Text style={styles.orText}>— OR —</Text>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={handleBiometricLogin}
            >
              <Text style={styles.biometricButtonText}>
                Login with Biometric
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.footerText}>
        Made with love by
        <Text style={{ fontWeight: 'bold' }}> solo-developer ❤️</Text>
      </Text>
    </KeyboardAvoidingView>
  );
};

export default MasterPasswordSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 110,
    height: 110,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#222222',
  },
  subtext: { fontSize: 12, color: 'gray', textAlign: 'center' },
  formContainer: { width: '100%', gap: 15 },
  footerText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 12,
    color: '#777',
  },
  inputWrapper: { position: 'relative' },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    color: 'gray',
    fontWeight: '500',
  },
  biometricButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  biometricButtonText: { fontSize: 16, color: '#222', fontWeight: '500' },
});
