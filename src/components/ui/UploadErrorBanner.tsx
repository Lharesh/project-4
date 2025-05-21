import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UploadErrorBannerProps {
  successCount: number;
  failureCount: number;
}

const UploadErrorBanner: React.FC<UploadErrorBannerProps> = ({ successCount, failureCount }) => {
  const hasErrors = failureCount > 0;
  return (
    <View style={[styles.banner, hasErrors ? styles.bannerError : styles.bannerSuccess]}>
      <Text style={styles.text}>
        {hasErrors
          ? `${failureCount} row(s) failed, ${successCount} succeeded.`
          : `All ${successCount} row(s) uploaded successfully!`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    padding: 10,
    borderRadius: 6,
    marginVertical: 10,
    alignItems: 'center',
  },
  bannerError: {
    backgroundColor: '#E57373', // Kapha (earthy red)
  },
  bannerSuccess: {
    backgroundColor: '#7BC47F', // Serene Ayurveda green
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default UploadErrorBanner;
