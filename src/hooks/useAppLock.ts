import { AppState } from 'react-native';
import { useEffect } from 'react';
import { navigationRef } from '../navigation/RootNavigation';
import { appLockEnabled } from '../utils/AppLockState';

let wasBackgrounded = false;

export const useAppLock = () => {
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (!appLockEnabled) return; 

      if (state === 'background') {
        wasBackgrounded = true;
      }

      if (state === 'active' && wasBackgrounded) {
        wasBackgrounded = false;

        if (navigationRef.isReady()) {
          navigationRef.navigate('MasterPasswordSetup');
        }
      }
    });

    return () => sub.remove();
  }, []);
};
