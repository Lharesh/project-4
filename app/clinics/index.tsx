import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateClinic } from '@/redux/slices/clinicSlice';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { Toast } from '@/components/ui/Toast';
import { COLORS } from '@/constants/theme';
import { CreditCard as Edit2, CircleCheck as CheckCircle, Camera, Calendar, ArrowLeft } from 'lucide-react-native';

export default function ClinicProfileScreen() {
  const dispatch = useAppDispatch();
  const { currentClinic, isLoading } = useAppSelector((state) => state.clinic);
  
  const [isEditing, setIsEditing] = useState(false);
  const [clinicName, setClinicName] = useState('');
  const [clinicEmail, setClinicEmail] = useState('');
  const [clinicPhone, setClinicPhone] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');
   const navigation = useNavigation();
console.log('NAV STATE:', navigation.canGoBack?.());
useLayoutEffect(() => {
  navigation.setOptions({
    title: 'Dashboard',
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 16 }}>
        <ArrowLeft size={24} color="#333" />
      </TouchableOpacity>
    ),
  });
}, [navigation]);

  // If still loading data
  if (!currentClinic) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading clinic profile...</Text>
      </View>
    );
  }

  const handleEdit = () => {
    setClinicName(currentClinic.name);
    setClinicEmail(currentClinic.email);
    setClinicPhone(currentClinic.phone);
    setClinicAddress(currentClinic.address);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await dispatch(updateClinic({
        name: clinicName,
        email: clinicEmail,
        phone: clinicPhone,
        address: clinicAddress,
      }));
      
      setIsEditing(false);
      setToastMessage('Clinic profile updated successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to update clinic profile');
      setToastType('error');
      setShowToast(true);
    }
  };

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
          <Text style={styles.headerTitle}>Clinic Profile</Text>
          {!isEditing ? (
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Edit2 size={18} color={COLORS.vata[500]} />
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: COLORS.kapha[100] }]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              <CheckCircle size={18} color={COLORS.kapha[600]} />
              <Text style={[styles.editButtonText, { color: COLORS.kapha[600] }]}>
                {isLoading ? 'Saving...' : 'Save'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.logoContainer}>
              {currentClinic.logo ? (
                <Image
                  source={{ uri: currentClinic.logo }}
                  style={styles.logo}
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoPlaceholderText}>
                    {currentClinic.name.charAt(0)}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.clinicInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.editInput}
                  value={clinicName}
                  onChangeText={setClinicName}
                  placeholder="Clinic Name"
                />
              ) : (
                <Text style={styles.clinicName}>{currentClinic.name}</Text>
              )}
              
              <Text style={styles.clinicId}>ID: {currentClinic.id}</Text>
              <Text style={styles.clinicDate}>
                Member since {formatDate(currentClinic.createdAt)}
              </Text>
            </View>
          </View>

          <SectionDivider title="Contact Information" />
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Email</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={clinicEmail}
                onChangeText={setClinicEmail}
                placeholder="Email"
                keyboardType="email-address"
              />
            ) : (
              <Text style={styles.infoValue}>{currentClinic.email}</Text>
            )}
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Phone</Text>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={clinicPhone}
                onChangeText={setClinicPhone}
                placeholder="Phone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.infoValue}>{currentClinic.phone}</Text>
            )}
          </View>
          
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Address</Text>
            {isEditing ? (
              <TextInput
                style={[styles.editInput, styles.multilineInput]}
                value={clinicAddress}
                onChangeText={setClinicAddress}
                placeholder="Address"
                multiline
              />
            ) : (
              <Text style={styles.infoValue}>{currentClinic.address}</Text>
            )}
          </View>
        </Card>

        <Card style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View>
              <Text style={styles.subscriptionTitle}>Subscription Details</Text>
              <Text style={styles.subscriptionSubtitle}>
                {currentClinic.subscription.planName}
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
          
          <View style={styles.dateRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Start Date</Text>
              <Text style={styles.dateValue}>
                {formatDate(currentClinic.subscription.startDate)}
              </Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Expiry Date</Text>
              <Text style={styles.dateValue}>
                {formatDate(currentClinic.subscription.endDate)}
              </Text>
            </View>
          </View>
          
          <View style={styles.usageInfo}>
            <Text style={styles.usageText}>
              {currentClinic.subscription.maxUsers} users allowed
            </Text>
          </View>
          
          <Button
            title="View Subscription"
            variant="outline"
            leftIcon={<Calendar size={16} color={COLORS.vata[500]} />}
            onPress={() => router.push('/clinics/subscription')}
            style={styles.subscriptionButton}
          />
        </Card>
      </ScrollView>
      
      <Toast
        visible={showToast}
        type={toastType}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />
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
    marginBottom: 16,
    marginTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.vata[50],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.vata[600],
    marginLeft: 4,
  },
  profileCard: {
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  logoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.vata[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholderText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.vata[700],
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.vata[500],
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  clinicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clinicName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  clinicId: {
    fontSize: 14,
    color: COLORS.neutral[500],
    marginBottom: 2,
  },
  clinicDate: {
    fontSize: 14,
    color: COLORS.neutral[500],
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.neutral[500],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  editInput: {
    fontSize: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 6,
    backgroundColor: COLORS.white,
    color: COLORS.neutral[900],
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  subscriptionCard: {
    marginBottom: 20,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
  },
  subscriptionSubtitle: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginTop: 2,
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
  dateRow: {
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
  usageInfo: {
    marginBottom: 16,
  },
  usageText: {
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  subscriptionButton: {
    alignSelf: 'flex-start',
  },
});
