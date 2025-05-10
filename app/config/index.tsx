import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { saveConfig } from '@/redux/slices/configSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Picker, PickerItem } from '@/components/ui/Picker';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { Toast } from '@/components/ui/Toast';
import { COLORS, DoshaType, ThemeMode } from '@/constants/theme';
import { LogOut, Bell, Mail, MessageCircle, Smartphone, MoonStar, Languages as Language, Palette, ArrowLeft } from 'lucide-react-native';

export default function ConfigScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentClinic } = useAppSelector((state) => state.clinic);
  const { clinicConfig, isLoading } = useAppSelector((state) => state.config);
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info' | 'warning'>('success');

  // Local state for notifications
  const [notifications, setNotifications] = useState({
    sms: clinicConfig?.notifications.sms || false,
    email: clinicConfig?.notifications.email || false,
    whatsapp: clinicConfig?.notifications.whatsapp || false,
    pushNotifications: clinicConfig?.notifications.pushNotifications || false,
  });

  // Language options
  const languageOptions: PickerItem[] = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
  ];

  // Theme mode options
  const themeModeOptions: PickerItem[] = [
    { label: 'Light Mode', value: 'light' },
    { label: 'Dark Mode', value: 'dark' },
  ];

  // Dosha type options
  const doshaTypeOptions: PickerItem[] = [
    { label: 'Vata (Blue)', value: 'vata' },
    { label: 'Pitta (Red)', value: 'pitta' },
    { label: 'Kapha (Green)', value: 'kapha' },
  ];

  // Calendar options
  const calendarFirstDayOptions: PickerItem[] = [
    { label: 'Sunday', value: '0' },
    { label: 'Monday', value: '1' },
  ];

  const calendarDefaultViewOptions: PickerItem[] = [
    { label: 'Day View', value: 'day' },
    { label: 'Week View', value: 'week' },
    { label: 'Month View', value: 'month' },
  ];

  // If still loading data
  if (!clinicConfig || !user || !currentClinic) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  const handleNotificationToggle = (type: keyof typeof notifications) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type],
    });
  };

  const handleSaveSettings = async () => {
    try {
      await dispatch(saveConfig({
        notifications: notifications,
      }));
      
      setToastMessage('Settings saved successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to save settings');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleChangeLanguage = (value: string) => {
    dispatch(saveConfig({
      language: value as 'en' | 'hi' | 'es' | 'fr',
    }));
    
    setToastMessage('Language updated successfully');
    setToastType('success');
    setShowToast(true);
  };

  const handleChangeThemeMode = (value: string) => {
    dispatch(saveConfig({
      theme: {
        ...clinicConfig.theme,
        mode: value as ThemeMode,
      }
    }));
    
    setToastMessage('Theme mode updated successfully');
    setToastType('success');
    setShowToast(true);
  };

  const handleChangeDoshaType = (value: string) => {
    dispatch(saveConfig({
      theme: {
        ...clinicConfig.theme,
        doshaType: value as DoshaType,
      }
    }));
    
    setToastMessage('Theme color updated successfully');
    setToastType('success');
    setShowToast(true);
  };

  const handleChangeCalendarSetting = (
    setting: 'firstDayOfWeek' | 'defaultView',
    value: string
  ) => {
    if (setting === 'firstDayOfWeek') {
      dispatch(saveConfig({
        calendar: {
          ...clinicConfig.calendar,
          firstDayOfWeek: parseInt(value) as 0 | 1,
        }
      }));
    } else if (setting === 'defaultView') {
      dispatch(saveConfig({
        calendar: {
          ...clinicConfig.calendar,
          defaultView: value as 'day' | 'week' | 'month',
        }
      }));
    }
    
    setToastMessage('Calendar settings updated');
    setToastType('success');
    setShowToast(true);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userRole}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.clinicName}>{currentClinic.name}</Text>
        </Card>

        <SectionDivider title="Notifications" />

        <Card>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: COLORS.vata[100] }]}>
                <Bell size={20} color={COLORS.vata[600]} />
              </View>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications in your device
              </Text>
            </View>
            <Switch
              value={notifications.pushNotifications}
              onValueChange={() => handleNotificationToggle('pushNotifications')}
              trackColor={{
                false: COLORS.neutral[300],
                true: COLORS.vata[300],
              }}
              thumbColor={
                notifications.pushNotifications ? COLORS.vata[600] : COLORS.neutral[100]
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: COLORS.pitta[100] }]}>
                <Mail size={20} color={COLORS.pitta[600]} />
              </View>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Email Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications via email
              </Text>
            </View>
            <Switch
              value={notifications.email}
              onValueChange={() => handleNotificationToggle('email')}
              trackColor={{
                false: COLORS.neutral[300],
                true: COLORS.pitta[300],
              }}
              thumbColor={
                notifications.email ? COLORS.pitta[600] : COLORS.neutral[100]
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: COLORS.kapha[100] }]}>
                <Smartphone size={20} color={COLORS.kapha[600]} />
              </View>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>SMS Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications via SMS
              </Text>
            </View>
            <Switch
              value={notifications.sms}
              onValueChange={() => handleNotificationToggle('sms')}
              trackColor={{
                false: COLORS.neutral[300],
                true: COLORS.kapha[300],
              }}
              thumbColor={
                notifications.sms ? COLORS.kapha[600] : COLORS.neutral[100]
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: COLORS.vata[100] }]}>
                <MessageCircle size={20} color={COLORS.vata[600]} />
              </View>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>WhatsApp Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications via WhatsApp
              </Text>
            </View>
            <Switch
              value={notifications.whatsapp}
              onValueChange={() => handleNotificationToggle('whatsapp')}
              trackColor={{
                false: COLORS.neutral[300],
                true: COLORS.vata[300],
              }}
              thumbColor={
                notifications.whatsapp ? COLORS.vata[600] : COLORS.neutral[100]
              }
            />
          </View>

          <Button
            title="Save Notification Settings"
            onPress={handleSaveSettings}
            isLoading={isLoading}
            style={styles.saveButton}
          />
        </Card>

        <SectionDivider title="Appearance" />
        
        <Card>
          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: COLORS.pitta[100] }]}>
                <Language size={20} color={COLORS.pitta[600]} />
              </View>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Language</Text>
              <Text style={styles.settingDescription}>
                Select your preferred language
              </Text>
            </View>
          </View>
          
          <Picker
            items={languageOptions}
            selectedValue={clinicConfig.language}
            onValueChange={handleChangeLanguage}
            containerStyle={styles.pickerContainer}
          />

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: COLORS.kapha[100] }]}>
                <MoonStar size={20} color={COLORS.kapha[600]} />
              </View>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Theme Mode</Text>
              <Text style={styles.settingDescription}>
                Select light or dark mode
              </Text>
            </View>
          </View>
          
          <Picker
            items={themeModeOptions}
            selectedValue={clinicConfig.theme.mode}
            onValueChange={handleChangeThemeMode}
            containerStyle={styles.pickerContainer}
          />

          <View style={styles.settingItem}>
            <View style={styles.settingIconContainer}>
              <View style={[styles.iconBackground, { backgroundColor: COLORS.vata[100] }]}>
                <Palette size={20} color={COLORS.vata[600]} />
              </View>
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Color Theme</Text>
              <Text style={styles.settingDescription}>
                Select your preferred dosha theme
              </Text>
            </View>
          </View>
          
          <Picker
            items={doshaTypeOptions}
            selectedValue={clinicConfig.theme.doshaType}
            onValueChange={handleChangeDoshaType}
            containerStyle={styles.pickerContainer}
          />
        </Card>

        <SectionDivider title="Calendar Settings" />
        
        <Card>
          <Text style={styles.sectionSubtitle}>First Day of Week</Text>
          <Picker
            items={calendarFirstDayOptions}
            selectedValue={clinicConfig.calendar.firstDayOfWeek.toString()}
            onValueChange={(value) => handleChangeCalendarSetting('firstDayOfWeek', value)}
            containerStyle={styles.pickerContainer}
          />
          
          <Text style={styles.sectionSubtitle}>Default Calendar View</Text>
          <Picker
            items={calendarDefaultViewOptions}
            selectedValue={clinicConfig.calendar.defaultView}
            onValueChange={(value) => handleChangeCalendarSetting('defaultView', value)}
            containerStyle={styles.pickerContainer}
          />
        </Card>

        <View style={styles.logoutContainer}>
          <Button
            title="Logout"
            variant="outline"
            leftIcon={<LogOut size={18} color={COLORS.pitta[500]} />}
            onPress={handleLogout}
            style={styles.logoutButton}
            textStyle={{ color: COLORS.pitta[500] }}
          />
        </View>
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
    marginTop: 50,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
  },
  userCard: {
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.vata[200],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.vata[700],
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.neutral[600],
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: COLORS.vata[600],
    fontWeight: '500',
  },
  clinicName: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingIconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.neutral[900],
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  saveButton: {
    marginTop: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.neutral[800],
    marginBottom: 8,
  },
  logoutContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  logoutButton: {
    borderColor: COLORS.pitta[500],
  },
});

// ... keep all your current ConfigScreen code unchanged

export const options = ({ navigation }: { navigation: any }) => ({
  title: 'Settings',
  headerLeft: () => (
    <TouchableOpacity
      style={{ paddingLeft: 16 }}
      onPress={() => navigation.goBack()}
    >
      <ArrowLeft size={24} color={COLORS.neutral[700]} />
    </TouchableOpacity>
  ),
});
