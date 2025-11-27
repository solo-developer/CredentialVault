import { PermissionsAndroid, Platform } from 'react-native';

export const requestStoragePermission = async () => {
  if (Platform.OS !== "android") return true;

  try {
    // Android 13+ (API 33+)
    if (Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: "Storage Permission",
          message: "This app needs access to your storage to save downloaded backup files.",
          buttonPositive: "Allow",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    // Android 10–12 (API 29–32)
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: "Storage Permission",
        message: "This app needs access to your storage to save downloaded backup files.",
        buttonPositive: "Allow",
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn("Permission Error:", err);
    return false;
  }
};
