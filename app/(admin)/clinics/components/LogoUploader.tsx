import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Camera, Upload } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

interface LogoUploaderProps {
  logo?: string;
  onUpload: () => void;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ logo, onUpload }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onUpload}>
      {logo ? (
        <Image source={{ uri: logo }} style={styles.logo} />
      ) : (
        <View style={styles.placeholder}>
          <Camera size={32} color={COLORS.neutral[400]} />
          <Text style={styles.placeholderText}>Upload Logo</Text>
        </View>
      )}
      <View style={styles.uploadIcon}>
        <Upload size={16} color={COLORS.white} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  uploadIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.vata[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});