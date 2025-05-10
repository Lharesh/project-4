// app/(admin)/clinics/index.tsx

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { router } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchClinic } from '@/redux/slices/clinicSlice';
import { DashboardSection } from './components/DashboardSection';
import { DashboardCard } from '@/components/ui/DashboardCard';
import { ClinicForm } from './components/ClinicForm';
import { LogoUploader } from './components/LogoUploader';
import { COLORS } from '@/constants/theme';
import {
  Clock,
  Users,
  Calendar,
  Settings,
  MessageSquare,
  Star,
  BarChart2,
} from 'lucide-react-native';

export const options = {
  title: 'Dashboard',
  headerShown: true,
};

export default function ClinicDashboardScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentClinic, isLoading } = useAppSelector((state) => state.clinic);

  useEffect(() => {
    if (user?.clinicId) {
      dispatch(fetchClinic());
    }
  }, [user?.clinicId]);

  if (!currentClinic) return null;

  const handleSetupNavigation = (route: string) => {
    router.push(`/(admin)/clinics/setup/${route}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoSection}>
          <LogoUploader
            logo={currentClinic.logo}
            onUpload={() => console.log('Upload logo')}
          />
        </View>

        <DashboardSection title="Quick Stats">
          <View style={styles.statsGrid}>
            <DashboardCard
              title="Total Patients"
              value="124"
              icon={<Users size={24} color={COLORS.vata[600]} />}
              color="vata"
              style={styles.statsCard}
            />
            <DashboardCard
              title="Appointments"
              value="48"
              icon={<Calendar size={24} color={COLORS.pitta[600]} />}
              color="pitta"
              style={styles.statsCard}
            />
          </View>
        </DashboardSection>

        <DashboardSection title="Setup & Configuration">
          <DashboardCard
            title="Clinic Timings"
            value="Configure Hours"
            icon={<Clock size={24} color={COLORS.vata[600]} />}
            onPress={() => handleSetupNavigation('clinic-timings')}
          />
          <DashboardCard
            title="Staff Management"
            value="Manage Team"
            icon={<Users size={24} color={COLORS.pitta[600]} />}
            onPress={() => handleSetupNavigation('staff-management')}
            color="pitta"
          />
          <DashboardCard
            title="Treatment Slots"
            value="Setup Services"
            icon={<Settings size={24} color={COLORS.vata[500]} />}
            onPress={() => handleSetupNavigation('reports')}
            color="kapha"
          />
          <DashboardCard
            title="WhatsApp Templates"
            value="Manage Messages"
            icon={<MessageSquare size={24} color={COLORS.vata[600]} />}
            onPress={() => handleSetupNavigation('whatsapp-templates')}
          />
           <DashboardCard
            title="Reports"
            value="View Reports"
            icon={<BarChart2 size={24} color={COLORS.pitta[500]} />}
            onPress={() => handleSetupNavigation('reports')}
          />
        </DashboardSection>

        <DashboardSection title="Clinic Information">
          <ClinicForm
            name={currentClinic.name}
            email={currentClinic.email}
            phone={currentClinic.phone}
            address={currentClinic.address}
            onChangeName={() => {}}
            onChangeEmail={() => {}}
            onChangePhone={() => {}}
            onChangeAddress={() => {}}
            onSubmit={() => {}}
            isLoading={isLoading}
          />
        </DashboardSection>

        <DashboardSection title="Feedback">
          <DashboardCard
            title="Rate Us"
            value="Share Your Experience"
            icon={<Star size={24} color={COLORS.pitta[600]} />}
            color="pitta"
            onPress={() => console.log('Rate clinic')}
          />
        </DashboardSection>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/(app)/appointments')}>
          <Text style={styles.backText}>← Back to Appointments</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  content: {
    padding: 16,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statsCard: {
    flex: 1,
  },
  backButton: {
    marginTop: 32,
    alignSelf: 'center',
  },
  backText: {
    fontSize: 16,
    color: COLORS.vata[700],
    fontWeight: '600',
  },
});
