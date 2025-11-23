// services/BackupMergeService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from "react-native-fs";

export const loadBackupFromFile = async (filePath: string, overwrite: boolean) => {
  const json = await RNFS.readFile(filePath, "utf8");
  const imported = JSON.parse(json);

  if (overwrite) {
    await AsyncStorage.setItem("folders", JSON.stringify(imported.folders));
    await AsyncStorage.setItem("items", JSON.stringify(imported.items));
    return "Data overwritten successfully";
  } else {
    const oldFolders = JSON.parse(await AsyncStorage.getItem("folders") || "[]");
    const oldItems = JSON.parse(await AsyncStorage.getItem("items") || "[]");

    const mergedFolders = [...oldFolders, ...imported.folders];
    const mergedItems = [...oldItems, ...imported.items];

    await AsyncStorage.setItem("folders", JSON.stringify(mergedFolders));
    await AsyncStorage.setItem("items", JSON.stringify(mergedItems));

    return "Data merged successfully";
  }
};
