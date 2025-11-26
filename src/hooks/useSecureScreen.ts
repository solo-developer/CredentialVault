import { useEffect } from "react";
import { Alert, NativeModules, Platform } from "react-native";

const { ScreenshotPrevent } = NativeModules;

export default function useSecureScreen() {
  useEffect(() => {
    if (Platform.OS === "android") {
      ScreenshotPrevent.enableSecure();
    }

    // iOS: only detect screenshots (no blocking)
    const subscription = Platform.OS === "ios"
      ? (() => {
          const handler = () => {
            Alert.alert("Warning", "Screenshots are not allowed on this screen.");
          };

          // Modern screenshot listener
          const subs = require("react-native").DeviceEventEmitter.addListener(
            "onScreenshot",
            handler
          );

          return () => subs.remove();
        })()
      : undefined;

    return () => {
      if (Platform.OS === "android") {
        ScreenshotPrevent.disableSecure();
      }
      subscription?.();
    };
  }, []);
}
