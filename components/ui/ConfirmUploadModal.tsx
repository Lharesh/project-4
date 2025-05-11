import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ConfirmUploadModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  successCount: number;
  failureCount: number;
}

const ConfirmUploadModal: React.FC<ConfirmUploadModalProps> = ({ visible, onConfirm, onCancel, successCount, failureCount }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Confirm Upload</Text>
          <Text style={styles.bodyText}>
            {successCount} row(s) will be uploaded.
            {failureCount > 0 && `\n${failureCount} row(s) have errors and will not be uploaded.`}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.buttonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7BC47F', // Serene Ayurveda green
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 15,
    color: '#6D4D2F', // Ayurveda brown
    textAlign: 'center',
    marginBottom: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E57373', // Kapha (earthy red)
  },
  confirmButton: {
    backgroundColor: '#7BC47F', // Serene Ayurveda green
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ConfirmUploadModal;
