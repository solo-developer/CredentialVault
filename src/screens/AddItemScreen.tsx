import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme, GlobalStyles, AppColors } from '../styles/global';
import SecondaryHeader from '../components/SecondaryHeader';
import Item from '../types/Item';
import { addItem } from '../services/ItemService';
import Folder from '../types/Folder';
import CustomField from '../types/CustomField';
import { FOLDER_STORAGE_KEY } from '../Constants';
import { getFolders } from '../services/FolderService';
import Ionicons from "react-native-vector-icons/Ionicons";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { calculateStrength } from '../utils/PasswordUtils';

const AddItemScreen = ({ navigation }: any) => {
  const { colors, styles: themeStyles } = useAppTheme();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [url, setUrl] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [itemType, setItemType] = useState<'credential' | 'note'>('credential');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    const loadFolders = async () => {
      const storedFolders = await getFolders();
      setFolders(storedFolders);
      if (storedFolders.length > 0) setSelectedFolder(storedFolders[0]);
    };
    loadFolders();
  }, []);

  const addCustomField = () => {
    const newField: CustomField = {
      id: Date.now().toString(),
      label: '',
      value: '',
    };
    setCustomFields([...customFields, newField]);
  };

  const removeCustomField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleCustomFieldChange = (
    id: string,
    key: 'label' | 'value',
    text: string,
  ) => {
    setCustomFields(prev =>
      prev.map(field => (field.id === id ? { ...field, [key]: text } : field)),
    );
  };

  const saveItem = async () => {
    if (!selectedFolder) {
      Alert.alert('Selection Required', 'Please select a folder to save this item.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this credential.');
      return;
    }

    const newItem: Item = {
      id: Date.now().toString(),
      folderId: selectedFolder.id,
      name: name.trim(),
      username: itemType === 'credential' ? username.trim() : undefined,
      password: itemType === 'credential' ? password.trim() : undefined,
      url: itemType === 'credential' ? url.trim() : undefined,
      customFields: itemType === 'credential' ? customFields : undefined,
      content: itemType === 'note' ? noteContent.trim() : undefined,
      type: itemType,
    };
    await addItem(newItem);

    Alert.alert('Success', 'Item saved successfully!');
    navigation.navigate('Dashboard', {
      screen: 'Home',
      params: { refresh: Date.now() },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SecondaryHeader
        title={itemType === 'credential' ? 'New Credential' : 'New Secure Note'}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={saveItem} style={styles.saveHeaderBtn}>
            <Text style={[styles.saveHeaderText, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={themeStyles.screenContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 16 }}
      >
        <Text style={themeStyles.label}>Select Folder</Text>
        <View style={styles.folderContainer}>
          {folders.map(folder => (
            <TouchableOpacity
              key={folder.id}
              activeOpacity={0.7}
              style={[
                styles.folderChip,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedFolder?.id === folder.id && styles.folderChipActive,
                selectedFolder?.id === folder.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => setSelectedFolder(folder)}
            >
              <Ionicons
                name={selectedFolder?.id === folder.id ? "folder-open" : "folder-outline"}
                size={16}
                color={selectedFolder?.id === folder.id ? colors.white : colors.textMain}
              />
              <Text
                style={[
                  styles.folderChipText,
                  { color: selectedFolder?.id === folder.id ? colors.white : colors.textMain },
                  selectedFolder?.id === folder.id && styles.folderChipTextActive,
                ]}
              >
                {folder.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Type Selector */}
        <View style={[styles.typeSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.typeBtn, itemType === 'credential' && styles.typeBtnActive, itemType === 'credential' && { backgroundColor: colors.primary }]}
            onPress={() => setItemType('credential')}
          >
            <Ionicons name="key-outline" size={20} color={itemType === 'credential' ? colors.white : colors.textMuted} />
            <Text style={[styles.typeBtnText, itemType === 'credential' && styles.typeBtnTextActive, itemType === 'credential' && { color: colors.white }]}>Credential</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, itemType === 'note' && styles.typeBtnActive, itemType === 'note' && { backgroundColor: colors.primary }]}
            onPress={() => setItemType('note')}
          >
            <Ionicons name="document-text-outline" size={20} color={itemType === 'note' ? colors.white : colors.textMuted} />
            <Text style={[styles.typeBtnText, itemType === 'note' && styles.typeBtnTextActive, itemType === 'note' && { color: colors.white }]}>Note</Text>
          </TouchableOpacity>
        </View>

        <Text style={themeStyles.label}>Title</Text>
        <TextInput
          style={themeStyles.inputMd}
          placeholder={itemType === 'credential' ? "e.g. Gmail, Amazon, Work VPN" : "e.g. Wi-Fi Password, Secret Backup Codes"}
          placeholderTextColor={colors.textLight}
          value={name}
          onChangeText={setName}
        />

        {itemType === 'credential' ? (
          <>
            <Text style={themeStyles.label}>Username or Email</Text>
            <TextInput
              style={themeStyles.inputMd}
              placeholder="Username / Email"
              placeholderTextColor={colors.textLight}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={themeStyles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[themeStyles.inputMd, { paddingRight: 50 }]}
                placeholder="Password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {password.length > 0 && (
              <View style={styles.strengthMeter}>
                <View style={[styles.strengthBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.strengthBar, { width: `${(calculateStrength(password).score + 1) * 20}%`, backgroundColor: calculateStrength(password).color, position: 'absolute' }]} />
                </View>
                <Text style={[styles.strengthText, { color: calculateStrength(password).color }]}>{calculateStrength(password).label}</Text>
              </View>
            )}

            <Text style={themeStyles.label}>Website URL</Text>
            <TextInput
              style={themeStyles.inputMd}
              placeholder="https://example.com"
              placeholderTextColor={colors.textLight}
              value={url}
              onChangeText={setUrl}
              autoCapitalize="none"
              keyboardType="url"
            />
          </>
        ) : (
          <>
            <Text style={themeStyles.label}>Secure Note</Text>
            <TextInput
              style={[themeStyles.inputMd, { height: 150, textAlignVertical: 'top' }]}
              placeholder="Type your sensitive information here..."
              placeholderTextColor={colors.textLight}
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
            />
          </>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.customFieldHeader}>
          <Text style={themeStyles.subtitle}>Custom Fields</Text>
          <TouchableOpacity onPress={addCustomField} style={styles.addFieldBtn}>
            <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.addFieldText, { color: colors.primary }]}>Add Field</Text>
          </TouchableOpacity>
        </View>

        {customFields.length === 0 && (
          <Text style={[styles.hintText, { color: colors.textMuted }]}>Custom fields allow you to store extra info like Security Questions, API Keys, etc.</Text>
        )}

        {customFields.map((field, index) => (
          <View key={field.id} style={[styles.customFieldCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.customFieldRow}>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={[styles.customInputSm, { color: colors.textMain, borderColor: colors.border }]}
                  placeholder="Label (e.g. Pin)"
                  placeholderTextColor={colors.textLight}
                  value={field.label}
                  onChangeText={text => handleCustomFieldChange(field.id, 'label', text)}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <TextInput
                  style={[styles.customInputSm, { color: colors.textMain, borderColor: colors.border }]}
                  placeholder="Value"
                  placeholderTextColor={colors.textLight}
                  value={field.value}
                  onChangeText={text => handleCustomFieldChange(field.id, 'value', text)}
                />
              </View>
              <TouchableOpacity
                onPress={() => removeCustomField(field.id)}
                style={styles.removeFieldBtn}
              >
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[themeStyles.button, { marginTop: 40 }]}
          onPress={saveItem}
          activeOpacity={0.8}
        >
          <Text style={themeStyles.buttonText}>Save {itemType === 'credential' ? 'Credential' : 'Note'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textMain,
    letterSpacing: -0.5,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
  },
  saveHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: `${AppColors.primary}10`,
  },
  saveHeaderText: {
    color: AppColors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  folderContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 16,
  },
  folderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginRight: 10,
    marginBottom: 10,
  },
  folderChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  folderChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textMain,
    marginLeft: 6,
  },
  folderChipTextActive: {
    color: AppColors.white,
    fontWeight: '700',
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: `${AppColors.textMuted}08`,
    padding: 4,
    borderRadius: 14,
    marginBottom: 20,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  typeBtnActive: {
    backgroundColor: AppColors.primary,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textMuted,
  },
  typeBtnTextActive: {
    color: AppColors.white,
  },
  strengthMeter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: AppColors.border,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'right',
  },
  formSection: {
    marginTop: 10,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center'
  },
  eyeIconBtn: {
    position: 'absolute',
    right: 14,
    padding: 8,
  },
  divider: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 24,
  },
  customFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addFieldBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  addFieldText: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
    marginLeft: 4,
  },
  customFieldCard: {
    backgroundColor: AppColors.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  customFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customInputSm: {
    fontSize: 15,
    color: AppColors.textMain,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  removeFieldBtn: {
    padding: 8,
    marginLeft: 6,
  },
  hintText: {
    fontSize: 13,
    color: AppColors.textLight,
    lineHeight: 18,
    marginBottom: 16,
    fontStyle: 'italic',
  }
});

export default AddItemScreen;
