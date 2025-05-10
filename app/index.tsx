import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, InteractionManager } from 'react-native';
import { router } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import Button from '@/components/ui/Button';
import { COLORS } from '@/constants/theme';

export default function LandingScreen() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
  if (!isAuthenticated) return;
  const task = InteractionManager.runAfterInteractions(() => {
    router.replace('/appointments');
  });
  return () => task.cancel(); // clean up
}, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/4046567/pexels-photo-4046567.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260' }}
            style={styles.logoBackground}
          />
          <View style={styles.overlay} />
          <Text style={styles.logoText}>AyurAI</Text>
          <Text style={styles.tagline}>Modern Ayurveda for Modern Clinics</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>Welcome to AyurAIClinics</Text>
          <Text style={styles.description}>
            The complete clinic management system designed specifically for Ayurvedic clinics and hospitals.
            Manage appointments, patient records, inventory, billing, and more - all in one place.
          </Text>

          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: COLORS.vata[500] }]} />
              <Text style={styles.featureText}>Patient Management</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: COLORS.pitta[500] }]} />
              <Text style={styles.featureText}>Appointment Scheduling</Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: COLORS.kapha[500] }]} />
              <Text style={styles.featureText}>Inventory Tracking</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={[styles.featureDot, { backgroundColor: COLORS.vata[300] }]} />
              <Text style={styles.featureText}>Billing & Reports</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Login"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() => router.push('/auth/login')}
            style={styles.button}
          />
          <Button
            title="Register"
            variant="outline"
            size="lg"
            fullWidth
            onPress={() => router.push('/auth/register')}
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    height: 200,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  logoBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: COLORS.white,
    marginTop: 8,
  },
  infoContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: COLORS.neutral[700],
    lineHeight: 24,
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.neutral[800],
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  button: {
    marginBottom: 12,
  },
});