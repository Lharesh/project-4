import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DownloadTemplateButtonProps {
  onPress: () => void;
}

const DownloadTemplateButton: React.FC<DownloadTemplateButtonProps> = ({ onPress }) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Feather name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
    <Text style={styles.text}>Download Template</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7BC47F', // Serene Ayurveda green
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    elevation: 2,
    marginVertical: 8,
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DownloadTemplateButton;
