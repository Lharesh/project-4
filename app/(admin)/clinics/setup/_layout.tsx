import { Stack } from 'expo-router';
import { getHeaderWithBack } from '@/utils/navigationOptions';

export default function SetupLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true, // prevent extra "setup" header
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="clinic-timings"
        options={getHeaderWithBack('Clinic Timings')}
      />
      <Stack.Screen
        name="treatment-slots"
        options={getHeaderWithBack('Treatment Slots')}
      />
      <Stack.Screen
        name="staff-management"
        options={getHeaderWithBack('Staff Management')}
      />
      <Stack.Screen
        name="user-roles"
        options={getHeaderWithBack('User Roles')}
      />
      <Stack.Screen
        name="whatsapp-templates"
        options={getHeaderWithBack('WhatsApp Templates')}
      />
    </Stack>
  );
}
