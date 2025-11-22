// ViewItemScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

export default function ViewItemScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { item } = route.params;

  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>View Item</Text>
        <View style={{ width: 26 }} />
      </View>

      <Text style={styles.label}>Name</Text>
      <Text style={styles.value}>{item.name}</Text>

      <Text style={styles.label}>Username</Text>
      <Text style={styles.value}>{item.username}</Text>

      <Text style={styles.label}>Password</Text>

      <View style={styles.passwordRow}>
        <Text style={styles.value}>
          {showPassword ? item.password : "••••••••"}
        </Text>

        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={26}
            color="#007bff"
          />
        </TouchableOpacity>
      </View>

      {item.url ? (
        <>
          <Text style={styles.label}>URL</Text>
          <Text style={styles.value}>{item.url}</Text>
        </>
      ) : null}

      {/* Load custom fields */}
      {item.customFields?.map((cf :any) => (
        <View key={cf.id}>
          <Text style={styles.label}>{cf.label}</Text>
          <Text style={styles.value}>{cf.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
  justifyContent: "space-between",
},
  title: { fontSize: 20, fontWeight: "bold", flexDirection:"row" },
  label: { fontSize: 14, marginTop: 14, color: "#666" },
  value: { fontSize: 16, marginTop: 4, marginBottom: 6 },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  }
});
