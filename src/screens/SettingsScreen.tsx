import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GlobalStyles } from '../styles/global';

export default function SettingsScreen({ navigation }: any) {
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [useBiometricLogin, setUseBiometricLogin] = useState(false);

  useEffect(() => {
    const rnBiometrics = new ReactNativeBiometrics();
    rnBiometrics.isSensorAvailable()
      .then((resultObject) => {
        const { available } = resultObject;
        setBiometricsAvailable(available);
      })
      .catch(() => setBiometricsAvailable(false));

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
      <Text style={GlobalStyles.subtitle}>Settings</Text>

      {/* Change Login Info Card */}
      <TouchableOpacity style={styles.cardButton} onPress={changeLoginInformationClicked}>
        <Ionicons name="key-outline" size={22} color="#fff" />
        <Text style={styles.cardButtonText}>Change Login Information</Text>
      </TouchableOpacity>

      {/* Biometric Option Card */}
      {biometricsAvailable && (
        <View style={styles.card}>
          <View style={styles.biometricRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="finger-print-outline" size={22} color="#333" />
              <Text style={styles.biometricText}>Use Biometric Login</Text>
            </View>
            <Switch
              value={useBiometricLogin}
              onValueChange={toggleBiometricLogin}
              trackColor={{ false: '#ccc', true: '#4cd137' }}
              thumbColor={useBiometricLogin ? '#fff' : '#fff'}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f6fa' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#2d3436' },

  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#0984e3',
    borderRadius: 12,
    justifyContent: 'center',
    elevation: 3,
  },
  cardButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    elevation: 2,
  },

  biometricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  biometricText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#2d3436',
    fontWeight: '600',
  },
});
