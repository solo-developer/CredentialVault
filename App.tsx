import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import MasterPasswordSetup from './src/screens/MasterPasswordScreen';
import Dashboard from './src/screens/Dashboard';
import AddItemScreen from './src/screens/AddItemScreen';
import FolderItemsScreen from './src/screens/FolderItemsScreen';
import ViewItemScreen from './src/screens/ViewItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import ChangeLoginInformationScreen from './src/screens/ChangeLoginInformationScreen';
import { initBackgroundSync } from './src/services/BackgroundSync';
import { useAppLock } from './src/hooks/useAppLock';
import { navigationRef } from './src/navigation/RootNavigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { MASTER_PASSWORD_KEY } from './src/Constants';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasMasterPassword, setHasMasterPassword] = useState(false);
  useAppLock();
  useEffect(() => {
    initBackgroundSync();
  }, []);
  useEffect(() => {
    const checkMasterPassword = async () => {
      const password = await AsyncStorage.getItem(MASTER_PASSWORD_KEY);
      setHasMasterPassword(!!password);
      setLoading(false);
    };
    checkMasterPassword();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="MasterPasswordSetup"
              component={MasterPasswordSetup}
            />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen name="AddItem" component={AddItemScreen} />
            <Stack.Screen name="FolderItems" component={FolderItemsScreen} />
            <Stack.Screen name="ViewItem" component={ViewItemScreen} />
            <Stack.Screen name="EditItem" component={EditItemScreen as any} />
            <Stack.Screen
              name="ChangeLoginScreen"
              component={ChangeLoginInformationScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
