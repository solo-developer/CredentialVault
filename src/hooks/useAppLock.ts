import { AppState } from 'react-native';
import { useEffect } from 'react';
import { navigationRef } from '../navigation/RootNavigation';
import { appLockEnabled } from '../utils/AppLockState';
import AsyncStorage from '@react-native-async-storage/async-storage';

let backgroundTimestamp = 0;

export const useAppLock = () => {
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      const requireLock = await AsyncStorage.getItem('@require_app_lock');
      if (requireLock === 'false') return;
      if (!appLockEnabled) return;

      if (state === 'background') {
        backgroundTimestamp = Date.now();
      }

      if (state === 'active') {
        const now = Date.now();
        const timePassed = now - backgroundTimestamp;

        // Fetch user preference for lock threshold, default to 30s
        const savedThreshold = await AsyncStorage.getItem('@auto_lock_timer');
        const threshold = savedThreshold ? parseInt(savedThreshold) * 1000 : 30000;

        if (backgroundTimestamp !== 0 && timePassed > threshold) {
          if (navigationRef.isReady()) {
            (navigationRef as any).navigate('MasterPasswordSetup', { manualLock: true });
          }
        }
        backgroundTimestamp = 0;
      }
    });

    return () => sub.remove();
  }, []);
};
