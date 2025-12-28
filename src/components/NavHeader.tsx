import { CommonActions } from "@react-navigation/native";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useAppTheme } from "../styles/global";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NavHeader({ navigation }: any) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const logoutButtonClicked = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MasterPasswordSetup' }],
      }),
    );
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: colors.surface, paddingTop: Math.max(insets.top, 10) }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.surface} />
      <View style={[styles.container, { borderBottomColor: colors.border }]}>
        <View style={styles.logoRow}>
          <View style={[styles.iconBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.textMain }]}>Credential Vault</Text>
        </View>
        <TouchableOpacity
          onPress={logoutButtonClicked}
          style={[styles.logoutBtn, { backgroundColor: colors.background }]}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.textMain} />
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
  },
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 8,
  }
});
