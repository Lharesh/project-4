import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useAppSelector } from '@/redux/hooks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {SectionDivider} from '@/components/ui/SectionDivider';
import { COLORS } from '@/constants/theme';
import { Bell, Users, Calendar, Package } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAppSelector((state) => state.auth);
  const { currentClinic } = useAppSelector((state) => state.clinic);
  const { clinicConfig } = useAppSelector((state) => state.config);

  // If loading data
  if (!user || !currentClinic || !clinicConfig) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard data...</Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.clinicName}>{currentClinic.name}</Text>
          </View>
          <View style={styles.notificationContainer}>
            <Bell size={24} color={COLORS.neutral[600]} />
          </View>
        </View>

        <Card style={styles.subscriptionCard}>
          <View style={styles.subscriptionContent}>
            <View>
              <Text style={styles.subscriptionTitle}>
                {currentClinic.subscription.planName}
              </Text>
              <Text style={styles.subscriptionDate}>
                Valid until {formatDate(currentClinic.subscription.endDate)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    currentClinic.subscription.status === 'active'
                      ? COLORS.kapha[100]
                      : currentClinic.subscription.status === 'pending'
                      ? COLORS.warning + '30'
                      : COLORS.pitta[100],
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      currentClinic.subscription.status === 'active'
                        ? COLORS.kapha[700]
                        : currentClinic.subscription.status === 'pending'
                        ? COLORS.warning
                        : COLORS.pitta[700],
                  },
                ]}
              >
                {currentClinic.subscription.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.featuresList}>
            {currentClinic.subscription.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View
                  style={[
                    styles.featureDot,
                    { backgroundColor: COLORS.vata[500] },
                  ]}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </Card>

        <SectionDivider title="Quick Stats" />

        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <View
                style={[
                  styles.statIconBackground,
                  { backgroundColor: COLORS.vata[100] },
                ]}
              >
                <Users size={20} color={COLORS.vata[600]} />
              </View>
            </View>
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Patients</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <View
                style={[
                  styles.statIconBackground,
                  { backgroundColor: COLORS.pitta[100] },
                ]}
              >
                <Calendar size={20} color={COLORS.pitta[600]} />
              </View>
            </View>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <View
                style={[
                  styles.statIconBackground,
                  { backgroundColor: COLORS.kapha[100] },
                ]}
              >
                <Package size={20} color={COLORS.kapha[600]} />
              </View>
            </View>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Treatments</Text>
          </Card>
        </View>

        <SectionDivider title="Quick Actions" />

        <View style={styles.actionsContainer}>
          <Button
            title="New Appointment"
            leftIcon={<Calendar size={18} color={COLORS.white} />}
            style={styles.actionButton}
          />
          <Button
            title="Add Patient"
            variant="outline"
            leftIcon={<Users size={18} color={COLORS.vata[500]} />}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingTop: 50,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  clinicName: {
    fontSize: 16,
    color: COLORS.vata[600],
    fontWeight: '500',
  },
  notificationContainer: {
    padding: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  subscriptionCard: {
    marginBottom: 24,
  },
  subscriptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
  },
  subscriptionDate: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 6,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    alignItems: 'center',
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.neutral[600],
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
});