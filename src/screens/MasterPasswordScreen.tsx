import React, { useState, useEffect } from 'react';
import {
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
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from "../styles/global";

const MasterPasswordSetup: React.FC = () => {
  const navigation = useNavigation<any>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const storedPassword = await AsyncStorage.getItem('@master_password');
      const storedUsername = await AsyncStorage.getItem('@username');

      if (!storedPassword || !storedUsername) {
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, []);

  const handleSetup = async () => {
    if (!username.trim() || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    await AsyncStorage.setItem('@master_password', password);
    await AsyncStorage.setItem('@username', username.trim());

    navigation.replace('Dashboard');
  };

  const handleLogin = async () => {
    const storedPassword = await AsyncStorage.getItem('@master_password');
    const storedUsername = await AsyncStorage.getItem('@username');

    if (username.trim() === storedUsername && password === storedPassword) {
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Error', 'Invalid username or password');
    }
  };

  if (isFirstLaunch === null) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Logo */}
      <Image
        source={require('../assets/icon.png')} 
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.title}>
        {isFirstLaunch ? "Setup Master Password" : "Welcome Back"}
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

        <TextInput
          placeholder="Master Password"
          style={GlobalStyles.inputMd}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {isFirstLaunch && (
          <TextInput
            placeholder="Confirm Password"
            style={GlobalStyles.inputMd}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        )}

        <TouchableOpacity
          style={GlobalStyles.btnPrimary}
          onPress={isFirstLaunch ? handleSetup : handleLogin}
        >
          <Text style={GlobalStyles.buttonText}>
            {isFirstLaunch ? "Create Password" : "Login"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>with love from<Text style={{ fontWeight: "bold" }}> solo-developer ❤️</Text></Text>
    </KeyboardAvoidingView>
  );
};

export default MasterPasswordSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 110,
    height: 110,
    alignSelf: "center",
    marginBottom: 20,
    borderRadius: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#222222",
  },
  formContainer: {
    width: "100%",
    gap: 15,
  },
  footerText: {
    textAlign: "center",
    marginTop: 60,
    fontSize: 12,
    color: "#777",
  },
  subtext: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
  },
});
