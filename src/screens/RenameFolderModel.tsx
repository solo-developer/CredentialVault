import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

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

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Folder name"
          />

          <View style={styles.row}>
            <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
              <Text style={{ color: '#333' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSave}
              onPress={() => onSave(name.trim())}
            >
              <Text style={{ color: 'white' }}>Save</Text>
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
  btnCancel: { paddingVertical: 10, paddingHorizontal: 15 },
  btnSave: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
    marginLeft: 10,
  },
});
