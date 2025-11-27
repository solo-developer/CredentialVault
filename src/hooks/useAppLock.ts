// hooks/useAppLock.ts
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { navigationRef } from '../navigation/RootNavigation';

let appWasBackgrounded = false;

export const useAppLock = () => {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'background') {
        appWasBackgrounded = true;
      } else if (state === 'active' && appWasBackgrounded) {
        appWasBackgrounded = false;
        if (navigationRef.isReady()) {
          navigationRef.navigate('MasterPasswordSetup'); // force login
        }
      }
    });

    return () => subscription.remove();
  }, []);
};
