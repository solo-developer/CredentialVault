import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { GlobalStyles, AppColors } from '../styles/global';

type Props = {
  visible: boolean;
  defaultName: string;
  onCancel: () => void;
  onSave: (newName: string) => void;
};

export default function RenameFolderModal({
  visible,
  defaultName,
  onCancel,
  onSave,
}: Props) {
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    setName(defaultName);
  }, [defaultName]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Rename Folder</Text>
          <Text style={styles.subtitle}>Enter a new name for this collection</Text>

          <TextInput
            style={GlobalStyles.inputMd}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Personal, Work, Finance"
            placeholderTextColor={AppColors.textLight}
            autoFocus={visible}
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSave}
              onPress={() => onSave(name.trim())}
              activeOpacity={0.8}
            >
              <Text style={styles.saveText}>Rename</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: AppColors.white,
    padding: 24,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.textMain,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textMuted,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    alignItems: 'center',
  },
  btnCancel: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 8,
  },
  cancelText: {
    color: AppColors.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  btnSave: {
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  saveText: {
    color: AppColors.white,
    fontWeight: '700',
    fontSize: 15,
  }
});
