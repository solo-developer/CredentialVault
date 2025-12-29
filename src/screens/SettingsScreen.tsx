import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppTheme, AppColors, GlobalStyles } from '../styles/global';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen({ navigation }: any) {
  const { colors, styles: themeStyles } = useAppTheme();
  const { theme, setTheme } = useTheme();
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [useBiometricLogin, setUseBiometricLogin] = useState(false);
  const [autoLockTimer, setAutoLockTimer] = useState('30'); // Default to 30s as string for AsyncStorage
  const [requireAppLock, setRequireAppLock] = useState(true);


  useEffect(() => {
    const rnBiometrics = new ReactNativeBiometrics();
    rnBiometrics.isSensorAvailable()
      .then((resultObject) => {
        const { available } = resultObject;
        setBiometricsAvailable(available);
      })
      .catch(() => setBiometricsAvailable(false));

    const loadPreference = async () => {
      try {
        const savedBio = await AsyncStorage.getItem('@use_biometric_login');
        setUseBiometricLogin(savedBio === 'true');

        const savedTimer = await AsyncStorage.getItem('@auto_lock_timer');
        if (savedTimer) {
          setAutoLockTimer(savedTimer);
        }

        const savedLock = await AsyncStorage.getItem('@require_app_lock');
        setRequireAppLock(savedLock !== 'false'); // Default to true
      } catch (error) {
        console.log('Failed to load preferences', error);
      }
    };
    loadPreference();
  }, []);

  const changeLoginInformationClicked = () => {
    navigation.navigate('ChangeLoginScreen');
  };

  const updateAutoLockTimer = async (seconds: string) => {
    setAutoLockTimer(seconds);
    try {
      await AsyncStorage.setItem('@auto_lock_timer', seconds);
    } catch (error) {
      console.log('Failed to save auto lock timer', error);
    }
  };

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open link');
      console.error(err);
    });
  };

  return (
    <ScrollView style={themeStyles.container} showsVerticalScrollIndicator={false}>


      <Text style={[styles.sectionHeader, { color: colors.textMain }]}>Security</Text>

      <View style={themeStyles.card}>
        <TouchableOpacity style={styles.settingRow} onPress={changeLoginInformationClicked}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}12` }]}>
            <Ionicons name="key-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.textMain }]}>Change Login Information</Text>
            <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Update your master password</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary}12` }]}>
            <Ionicons name="lock-closed-outline" size={22} color={colors.secondary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.textMain }]}>Require App Lock</Text>
            <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Ask for password on startup</Text>
          </View>
          <Switch
            value={requireAppLock}
            onValueChange={async (val) => {
              setRequireAppLock(val);
              await AsyncStorage.setItem('@require_app_lock', val ? 'true' : 'false');
            }}
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={colors.white}
          />
        </View>

        {biometricsAvailable && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.settingRow}>
              <View style={[styles.iconContainer, { backgroundColor: `${colors.secondary}12` }]}>
                <Ionicons name="finger-print-outline" size={22} color={colors.secondary} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.textMain }]}>Use Biometric Login</Text>
                <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Unlock with fingerprint or face</Text>
              </View>
              <Switch
                value={useBiometricLogin}
                onValueChange={async (val) => {
                  setUseBiometricLogin(val);
                  await AsyncStorage.setItem('@use_biometric_login', val ? 'true' : 'false');
                }}
                trackColor={{ false: colors.border, true: colors.success }}
                thumbColor={colors.white}
              />
            </View>
          </>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.settingLayout}>
          <View style={styles.settingRow}>
            <View style={[styles.iconContainer, { backgroundColor: `${colors.warning}12` }]}>
              <Ionicons name="timer-outline" size={22} color={colors.warning} />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.textMain }]}>Auto Lock Timer</Text>
              <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Lock app after backgrounding</Text>
            </View>
          </View>

          <View style={styles.timerSelector}>
            {[
              { label: 'Instant', value: '0' },
              { label: '30s', value: '30' },
              { label: '1m', value: '60' },
              { label: '2m', value: '120' },
              { label: '5m', value: '300' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timerBtn,
                  autoLockTimer === option.value && { backgroundColor: `${colors.warning}15`, borderColor: colors.warning }
                ]}
                onPress={() => updateAutoLockTimer(option.value)}
              >
                <Text style={[
                  styles.timerBtnText,
                  { color: autoLockTimer === option.value ? colors.warning : colors.textMuted }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <Text style={[styles.sectionHeader, { color: colors.textMain }]}>Appearance</Text>
      <View style={themeStyles.card}>
        <View style={styles.themeSelector}>
          {(['light', 'dark', 'system'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.themeBtn,
                theme === t && { backgroundColor: `${colors.primary}15`, borderColor: colors.primary }
              ]}
              onPress={() => setTheme(t)}
            >
              <Ionicons
                name={t === 'light' ? 'sunny-outline' : t === 'dark' ? 'moon-outline' : 'phone-portrait-outline'}
                size={20}
                color={theme === t ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.themeBtnText, { color: theme === t ? colors.primary : colors.textMuted }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.sectionHeader, { color: colors.textMain }]}>Support & Social</Text>
      <View style={themeStyles.card}>
        <TouchableOpacity style={styles.settingRow} onPress={() => openUrl('https://www.buymeacoffee.com/solo_developer')}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFDD0020' }]}>
            <Ionicons name="cafe-outline" size={22} color="#FFDD00" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.textMain }]}>Buy Me a Coffee</Text>
            <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Support the development</Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.textLight} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <TouchableOpacity style={styles.settingRow} onPress={() => openUrl('https://github.com/solo-developer/CredentialVault')}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.textMain}10` }]}>
            <Ionicons name="logo-github" size={22} color={colors.textMain} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.textMain }]}>Star on GitHub</Text>
            <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Show some love to the project</Text>
          </View>
          <Ionicons name="star-outline" size={18} color="#f59e0b" />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionHeader, { color: colors.textMain }]}>App Info</Text>
      <View style={themeStyles.card}>
        <View style={styles.settingRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.textMuted}10` }]}>
            <Ionicons name="information-circle-outline" size={22} color={colors.textMuted} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.textMain }]}>Version</Text>
            <Text style={[styles.settingDesc, { color: colors.textMuted }]}>1.0.0 (Production Build)</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.settingRow}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}10` }]}>
            <Ionicons name="person-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: colors.textMain }]}>Developer</Text>
            <Text style={[styles.settingDesc, { color: colors.textMuted }]}>Niroj Dahal</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Credential Vault &copy; 2024</Text>
        <Text style={styles.footerSubText}>Safely secure your world.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: AppColors.textMain,
    marginBottom: 12,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.textMain,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
    color: AppColors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginLeft: 58,
  },
  footer: {
    marginTop: 40,
    marginBottom: 60,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: AppColors.textLight,
    fontWeight: '600',
  },
  footerSubText: {
    fontSize: 12,
    color: AppColors.textLight,
    marginTop: 4,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 10,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  timerSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingLeft: 58,
    paddingBottom: 8,
  },
  timerBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: `${AppColors.textMuted}08`,
  },
  timerBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingLayout: {
    flexDirection: 'column',
  }
});
