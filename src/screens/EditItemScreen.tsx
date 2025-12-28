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
import { useAppTheme, GlobalStyles, AppColors } from '../styles/global';
import SecondaryHeader from '../components/SecondaryHeader';
import { calculateStrength } from '../utils/PasswordUtils';
import Item from '../types/Item';
import { updateItem } from '../services/ItemService';
import Folder from '../types/Folder';
import CustomField from '../types/CustomField';
import { getFolders } from '../services/FolderService';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface EditItemScreenProps {
  navigation: any;
  route: {
    params: {
      item: Item;
    };
  };
}

const EditItemScreen: React.FC<EditItemScreenProps> = ({
  navigation,
  route,
}) => {
  const existingItem = route.params.item;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const [name, setName] = useState(existingItem.name);
  const [username, setUsername] = useState(existingItem.username);
  const [password, setPassword] = useState(existingItem.password);
  const [showPassword, setShowPassword] = useState(false);
  const [url, setUrl] = useState(existingItem.url);
  const [customFields, setCustomFields] = useState<CustomField[]>(
    existingItem.customFields || [],
  );
  const [noteContent, setNoteContent] = useState(existingItem.content || '');
  const { colors, styles: themeStyles } = useAppTheme();

  useEffect(() => {
    const loadFolders = async () => {
      const storedFolders = await getFolders();
      setFolders(storedFolders);

      const initialFolder = storedFolders.find(
        f => f.id === existingItem.folderId,
      );
      if (initialFolder) setSelectedFolder(initialFolder);
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

  const saveChanges = async () => {
    if (!selectedFolder) {
      Alert.alert('Selection Required', 'Please select a folder.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for this credential.');
      return;
    }

    const updatedItem: Item = {
      ...existingItem,
      folderId: selectedFolder.id,
      name: name.trim(),
      username: existingItem.type === 'credential' ? (username || '').trim() : undefined,
      password: existingItem.type === 'credential' ? (password || '').trim() : undefined,
      url: existingItem.type === 'credential' ? (url || '').trim() : undefined,
      customFields: existingItem.type === 'credential' ? customFields : undefined,
      content: existingItem.type === 'note' ? (noteContent || '').trim() : undefined,
    };

    await updateItem(updatedItem);

    Alert.alert('Success', 'Credential updated successfully!');
    navigation.navigate('Dashboard', {
      screen: 'Home',
      params: { refresh: Date.now() },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SecondaryHeader
        title={existingItem.type === 'note' ? 'Edit Note' : 'Edit Credential'}
        onBack={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={saveChanges} style={styles.saveHeaderBtn}>
            <Text style={[styles.saveHeaderText, { color: colors.primary }]}>Save</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={themeStyles.screenContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
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

        <Text style={themeStyles.label}>Title</Text>
        <TextInput
          style={themeStyles.inputMd}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Google Login, AWS Console"
          placeholderTextColor={colors.textLight}
        />

        {existingItem.type === 'credential' ? (
          <>
            <Text style={themeStyles.label}>Username / Email</Text>
            <TextInput
              style={themeStyles.inputMd}
              value={username}
              onChangeText={setUsername}
              placeholder="Email or handle"
              placeholderTextColor={colors.textLight}
              autoCapitalize="none"
            />

            <Text style={themeStyles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[themeStyles.inputMd, { paddingRight: 50 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Your secure password"
                placeholderTextColor={colors.textLight}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setShowPassword(prev => !prev)}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {password && password.length > 0 && (
              <View style={styles.strengthMeter}>
                <View style={[styles.strengthBar, { backgroundColor: colors.border }]}>
                  <View style={[styles.strengthBar, { width: `${(calculateStrength(password).score + 1) * 20}%`, backgroundColor: calculateStrength(password).color, position: 'absolute' }]} />
                </View>
                <Text style={[styles.strengthText, { color: calculateStrength(password).color }]}>{calculateStrength(password).label}</Text>
              </View>
            )}

            <Text style={themeStyles.label}>Website URL (Optional)</Text>
            <TextInput
              style={themeStyles.inputMd}
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com"
              placeholderTextColor={colors.textLight}
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

        {existingItem.type === 'credential' && (
          <>
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

            {customFields.map((field) => (
              <View key={field.id} style={[styles.customFieldCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.customFieldRow}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      style={[styles.customInputSm, { color: colors.textMain, borderColor: colors.border }]}
                      placeholder="Label"
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
          </>
        )}

        <TouchableOpacity
          style={[themeStyles.button, { marginTop: 40 }]}
          onPress={saveChanges}
          activeOpacity={0.8}
        >
          <Text style={themeStyles.buttonText}>Update {existingItem.type === 'credential' ? 'Credential' : 'Note'}</Text>
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
    letterSpacing: -0.5,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  saveHeaderBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: `${AppColors.primary}10`,
  },
  saveHeaderText: {
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
    borderWidth: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  folderChipActive: {
    // backgroundColor handled inline
    borderColor: AppColors.primary, // This can remain AppColors.primary or be changed to colors.primary
  },
  folderChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  folderChipTextActive: {
    fontWeight: '700',
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
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 80,
    textAlign: 'right',
  },
  hintText: {
    fontSize: 13,
    marginBottom: 20,
    lineHeight: 18,
    fontStyle: 'italic',
  }
});

export default EditItemScreen;
