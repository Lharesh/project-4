import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { COLORS } from '@/constants/theme';
import { ArrowLeft, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

export default function SubscriptionScreen() {
  const { currentClinic } = useAppSelector((state) => state.clinic);

  // If still loading data
  if (!currentClinic) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading subscription details...</Text>
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

  const getDaysRemaining = () => {
    const today = new Date();
    const endDate = new Date(currentClinic.subscription.endDate);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  const plans = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '$29',
      features: [
        { name: 'Up to 5 users', included: true },
        { name: 'Patient Management', included: true },
        { name: 'Basic Appointment Scheduling', included: true },
        { name: 'Limited Reports', included: true },
        { name: 'Basic Inventory', included: true },
        { name: 'Advanced Analytics', included: false },
        { name: 'Customizable Templates', included: false },
      ],
      current: currentClinic.subscription.planId === 'basic',
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '$79',
      features: [
        { name: 'Up to 10 users', included: true },
        { name: 'Patient Management', included: true },
        { name: 'Advanced Appointment Scheduling', included: true },
        { name: 'Comprehensive Reports', included: true },
        { name: 'Full Inventory Management', included: true },
        { name: 'Advanced Analytics', included: true },
        { name: 'Customizable Templates', included: true },
      ],
      current: currentClinic.subscription.planId === 'premium',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.neutral[700]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={{ width: 24 }} />
        </View>

        <Card style={styles.currentPlanCard}>
          <Text style={styles.currentPlanTitle}>Current Plan</Text>
          <View style={styles.planNameContainer}>
            <Text style={styles.planName}>{currentClinic.subscription.planName}</Text>
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

          <View style={styles.dateContainer}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Started</Text>
              <Text style={styles.dateValue}>
                {formatDate(currentClinic.subscription.startDate)}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Expires</Text>
              <Text style={styles.dateValue}>
                {formatDate(currentClinic.subscription.endDate)}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.remainingContainer,
              {
                backgroundColor:
                  daysRemaining > 30
                    ? COLORS.kapha[50]
                    : daysRemaining > 7
                    ? COLORS.warning + '20'
                    : COLORS.pitta[50],
              },
            ]}
          >
            <View
              style={[
                styles.remainingIconContainer,
                {
                  backgroundColor:
                    daysRemaining > 30
                      ? COLORS.kapha[100]
                      : daysRemaining > 7
                      ? COLORS.warning + '30'
                      : COLORS.pitta[100],
                },
              ]}
            >
              {daysRemaining > 30 ? (
                <CheckCircle size={18} color={COLORS.kapha[600]} />
              ) : daysRemaining > 7 ? (
                <AlertCircle size={18} color={COLORS.warning} />
              ) : (
                <XCircle size={18} color={COLORS.pitta[600]} />
              )}
            </View>
            <Text
              style={[
                styles.remainingText,
                {
                  color:
                    daysRemaining > 30
                      ? COLORS.kapha[700]
                      : daysRemaining > 7
                      ? COLORS.neutral[800]
                      : COLORS.pitta[700],
                },
              ]}
            >
              {daysRemaining > 0
                ? `${daysRemaining} days remaining`
                : 'Subscription expired'}
            </Text>
          </View>
        </Card>

        <SectionDivider title="Available Plans" />

        {plans.map((plan) => (
          <Card
            key={plan.id}
            style={[
              styles.planCard,
              plan.current && {
                borderColor: COLORS.vata[500],
                borderWidth: 2,
              },
            ]}
          >
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planCardTitle}>{plan.name}</Text>
                <Text style={styles.planPrice}>{plan.price} / month</Text>
              </View>
              {plan.current && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>CURRENT</Text>
                </View>
              )}
            </View>

            <View style={styles.featuresList}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  {feature.included ? (
                    <CheckCircle size={16} color={COLORS.kapha[500]} />
                  ) : (
                    <XCircle size={16} color={COLORS.neutral[400]} />
                  )}
                  <Text
                    style={[
                      styles.featureText,
                      !feature.included && styles.disabledFeatureText,
                    ]}
                  >
                    {feature.name}
                  </Text>
                </View>
              ))}
            </View>

            <Button
              title={plan.current ? 'Current Plan' : 'Upgrade'}
              variant={plan.current ? 'outline' : 'primary'}
              disabled={plan.current}
              fullWidth
              style={styles.planButton}
            />
          </Card>
        ))}
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
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
  },
  currentPlanCard: {
    marginBottom: 24,
  },
  currentPlanTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[600],
    marginBottom: 8,
  },
  planNameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
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
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.neutral[500],
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    color: COLORS.neutral[900],
    fontWeight: '500',
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  remainingIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  remainingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  planCard: {
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: COLORS.neutral[600],
  },
  currentBadge: {
    backgroundColor: COLORS.vata[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.vata[700],
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.neutral[800],
  },
  disabledFeatureText: {
    color: COLORS.neutral[400],
  },
  planButton: {
    marginTop: 8,
  },
});