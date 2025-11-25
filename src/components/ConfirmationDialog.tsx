import { Alert } from "react-native";

export function showConfirmationDialog( title : string,message: string,buttonText :string, onConfirm: ({}:any) => void
) {
  Alert.alert(
   title,
   message,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: buttonText,
        style: "destructive",
        onPress: onConfirm,
      },
    ]
  );
}