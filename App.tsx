import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import MasterPasswordSetup from './src/screens/MasterPasswordScreen';
import Dashboard from './src/screens/Dashboard';
import AddItemScreen from './src/screens/AddItemScreen';
import FolderItemsScreen from './src/screens/FolderItemsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasMasterPassword, setHasMasterPassword] = useState(false);

  useEffect(() => {
    const checkMasterPassword = async () => {
      const password = await AsyncStorage.getItem('masterPassword');
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
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!hasMasterPassword ? (
          <Stack.Screen name="MasterPasswordSetup" component={MasterPasswordSetup} />
        ) : null}
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="AddItem" component={AddItemScreen} />
        <Stack.Screen name="FolderItems" component={FolderItemsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
