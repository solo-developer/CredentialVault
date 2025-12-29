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
        const savedThreshold = await AsyncStorage.getItem('@auto_lock_timer');
        const threshold = savedThreshold ? parseInt(savedThreshold) * 1000 : 30000;

        if (threshold === 0) {
          if (navigationRef.isReady()) {
            const currentRoute = navigationRef.getCurrentRoute();
            if (currentRoute?.name !== 'MasterPasswordSetup') {
              (navigationRef as any).navigate('MasterPasswordSetup', { manualLock: true });
            }
          }
          backgroundTimestamp = 0; // Don't trigger again on active
        } else {
          backgroundTimestamp = Date.now();
        }
      }

      if (state === 'active') {
        if (backgroundTimestamp === 0) return;

        const now = Date.now();
        const timePassed = now - backgroundTimestamp;

        const savedThreshold = await AsyncStorage.getItem('@auto_lock_timer');
        const threshold = savedThreshold ? parseInt(savedThreshold) * 1000 : 30000;

        if (timePassed > threshold) {
          if (navigationRef.isReady()) {
            const currentRoute = navigationRef.getCurrentRoute();
            if (currentRoute?.name !== 'MasterPasswordSetup') {
              (navigationRef as any).navigate('MasterPasswordSetup', { manualLock: true });
            }
          }
        }
        backgroundTimestamp = 0;
      }
    });

    return () => sub.remove();
  }, []);
};
