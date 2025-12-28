import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export const getAppColors = (isDark: boolean) => ({
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#f43f5e',
  warning: '#f59e0b',
  background: isDark ? '#0f172a' : '#f8fafc',
  surface: isDark ? '#1e293b' : '#ffffff',
  border: isDark ? '#334155' : '#e2e8f0',
  textMain: isDark ? '#f1f5f9' : '#1e293b',
  textMuted: isDark ? '#94a3b8' : '#64748b',
  textLight: isDark ? '#64748b' : '#94a3b8',
  white: '#ffffff',
  shadow: isDark ? '#000000' : '#000000',
});

// Legacy support for files not yet refactored to use the hook
export const AppColors = getAppColors(false);

export const getGlobalStyles = (isDark: boolean) => {
  const colors = getAppColors(isDark);
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 20, // Increased for better spacing with NavHeader
      paddingBottom: 16,
    },
    loginContainer: {
      flex: 1,
      padding: 24,
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    navTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textMain,
      letterSpacing: -0.5,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMain,
      marginTop: 16,
      marginBottom: 6,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: '700',
    },
    inputMd: {
      borderWidth: 1.5,
      borderColor: colors.border,
      padding: 14,
      borderRadius: 12,
      fontSize: 16,
      marginVertical: 8,
      color: colors.textMain,
      backgroundColor: colors.surface,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.textMain,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 16,
      color: colors.textMain,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      padding: 20,
    },
    modalBox: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 16,
      lineHeight: 24,
    },
    floatingButton: {
      position: "absolute",
      bottom: 90,
      right: 25,
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      elevation: 8,
      shadowColor: colors.primary,
      shadowOpacity: 0.4,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 10,
      zIndex: 1000,
    },
    floatingMenu: {
      position: "absolute",
      bottom: 165,
      right: 25,
      backgroundColor: colors.surface,
      padding: 12,
      borderRadius: 16,
      elevation: 10,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      width: 180,
      zIndex: 1000,
    },
    menuBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    menuText: {
      color: colors.textMain,
      marginLeft: 12,
      fontSize: 15,
      fontWeight: '600',
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    screenContainer: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingBottom: 16,
    }
  });
};

export const GlobalStyles = getGlobalStyles(false);

export const useAppTheme = () => {
  const { isDark } = useTheme();
  const colors = getAppColors(isDark);
  const styles = getGlobalStyles(isDark);
  return { colors, styles, isDark };
};
