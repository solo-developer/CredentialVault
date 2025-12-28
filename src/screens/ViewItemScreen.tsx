// ViewItemScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Clipboard, ToastAndroid, Alert, Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useAppTheme, AppColors, GlobalStyles } from "../styles/global";
import SecondaryHeader from "../components/SecondaryHeader";

export default function ViewItemScreen() {
  const { colors, styles: themeStyles } = useAppTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { item } = route.params;

  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`${label} copied to clipboard`, ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', `${label} copied to clipboard`);
    }
  };

  const DetailSection = ({ label, value, isSensitive = false, canCopy = true }: any) => (
    <View style={styles.detailItem}>
      <View style={styles.detailHeader}>
        <Text style={styles.detailLabel}>{label}</Text>
        {canCopy && (
          <TouchableOpacity onPress={() => copyToClipboard(value, label)} style={styles.copyButton}>
            <Ionicons name="copy-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.detailValueContainer}>
        <Text style={styles.detailValue}>
          {isSensitive ? (showPassword ? value : "••••••••••••") : value}
        </Text>
        {isSensitive && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SecondaryHeader
        title={item.type === 'note' ? 'Note Details' : 'Credential Details'}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => navigation.navigate('EditItem', { item })}
            style={styles.editButton}
          >
            <Ionicons name="pencil-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={themeStyles.screenContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
      >
        <View style={styles.profileSection}>
          <View style={[styles.avatarCircle, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}20`, borderWidth: 1 }]}>
            <Ionicons name={item.type === 'note' ? "document-text-outline" : "shield-checkmark-outline"} size={40} color={colors.primary} />
          </View>
          <Text style={[styles.itemName, { color: colors.textMain }]}>{item.name}</Text>
          {item.type === 'credential' && <Text style={[styles.itemCategory, { color: colors.textMuted }]}>{item.url || 'No URL provided'}</Text>}
        </View>

        {item.type === 'credential' ? (
          <View style={themeStyles.card}>
            <DetailSection label="Username" value={item.username} />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <DetailSection label="Password" value={item.password} isSensitive={true} />
          </View>
        ) : (
          <View style={themeStyles.card}>
            <Text style={[styles.detailLabel, { marginBottom: 10 }]}>Secure Note</Text>
            <Text style={[styles.noteContent, { color: colors.textMain }]}>{item.content}</Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(item.content || "", "Note")}
              style={[styles.copyNoteBtn, { backgroundColor: `${colors.primary}08` }]}
            >
              <Ionicons name="copy-outline" size={16} color={colors.primary} />
              <Text style={[styles.copyNoteText, { color: colors.primary }]}>Copy Note</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.url ? (
          <View style={GlobalStyles.card}>
            <DetailSection label="Website URL" value={item.url} />
          </View>
        ) : null}

        {item.customFields && item.customFields.length > 0 && (
          <View style={GlobalStyles.card}>
            <Text style={styles.sectionTitle}>Custom Fields</Text>
            {item.customFields.map((cf: any, index: number) => (
              <View key={cf.id}>
                {index > 0 && <View style={styles.divider} />}
                <DetailSection label={cf.label} value={cf.value} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 12,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
  },
  editButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: `${AppColors.primary}10`,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.textMain,
    letterSpacing: -0.5,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${AppColors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '800',
    color: AppColors.textMain,
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 14,
    color: AppColors.textMuted,
    fontWeight: '500',
  },
  detailItem: {
    paddingVertical: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textMain,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  noteContent: {
    fontSize: 16,
    lineHeight: 24,
    color: AppColors.textMain,
    marginBottom: 20,
  },
  copyNoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  copyNoteText: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailValue: {
    fontSize: 17,
    fontWeight: '600',
    color: AppColors.textMain,
    flex: 1,
  },
  copyButton: {
    padding: 4,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 12,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 4,
  }
});
