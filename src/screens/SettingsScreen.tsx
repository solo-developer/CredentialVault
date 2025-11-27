import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';

export default function SettingsScreen({ navigation }: any) {
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [useBiometricLogin, setUseBiometricLogin] = useState(false);

  useEffect(() => {
    // Check if biometrics are available
    const rnBiometrics = new ReactNativeBiometrics();
    rnBiometrics.isSensorAvailable()
      .then((resultObject) => {
        const { available } = resultObject;
        setBiometricsAvailable(available);
      })
      .catch(() => setBiometricsAvailable(false));

    // Load saved preference from AsyncStorage
    const loadPreference = async () => {
      try {
        const saved = await AsyncStorage.getItem('@use_biometric_login');
        setUseBiometricLogin(saved === 'true');
      } catch (error) {
        console.log('Failed to load biometric preference', error);
      }
    };
    loadPreference();
  }, []);

  const changeLoginInformationClicked = () => {
    navigation.navigate('ChangeLoginScreen');
  };

  const logoutButtonClicked = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MasterPasswordSetup' }],
      }),
    );
  };

  const toggleBiometricLogin = async () => {
    const newValue = !useBiometricLogin;
    setUseBiometricLogin(newValue);

    try {
      await AsyncStorage.setItem('@use_biometric_login', newValue ? 'true' : 'false');
      Alert.alert(
        'Biometric Login',
        newValue ? 'Enabled biometric login' : 'Disabled biometric login'
      );
    } catch (error) {
      console.log('Failed to save biometric preference', error);
      Alert.alert('Error', 'Could not update biometric login preference.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.button} onPress={changeLoginInformationClicked}>
        <Text style={styles.buttonText}>Change Login Information</Text>
      </TouchableOpacity>

      {biometricsAvailable && (
        <View style={styles.biometricRow}>
          <Text style={styles.biometricText}>Use Biometric Login</Text>
          <Switch
            value={useBiometricLogin}
            onValueChange={toggleBiometricLogin}
          />
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={logoutButtonClicked}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  button: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  biometricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
  biometricText: { fontSize: 16 },
});
