export let appLockEnabled = true;

export const disableAppLock = () => {
  appLockEnabled = false;
};

export const enableAppLock = () => {
  appLockEnabled = true;
};
