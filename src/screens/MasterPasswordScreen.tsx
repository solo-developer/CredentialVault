import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';


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

  if (isFirstLaunch === null) return null; // wait for AsyncStorage check

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <Text style={styles.title}>
        {isFirstLaunch ? 'Setup Master Password' : 'Login'}
      </Text>

      <TextInput
        placeholder="Username"
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        placeholder="Master Password"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {isFirstLaunch && (
        <TextInput
          placeholder="Confirm Password"
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={isFirstLaunch ? handleSetup : handleLogin}
      >
        <Text style={styles.buttonText}>
          {isFirstLaunch ? 'Set Password' : 'Login'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

export default MasterPasswordSetup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4a90e2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
