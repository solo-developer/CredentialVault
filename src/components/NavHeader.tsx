import { CommonActions } from "@react-navigation/native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function NavHeader({ navigation } : any)  {
    const logoutButtonClicked = () => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MasterPasswordSetup' }],
          }),
        );
      };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Credential Vault</Text>
      <TouchableOpacity onPress={logoutButtonClicked}>
        <Ionicons name="log-out-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    height: 50,
    backgroundColor: "#3B82F6", 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 3,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
