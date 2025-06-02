// Helper hook to get navigation params from expo-router and normalize for appointment modal
import { useLocalSearchParams } from 'expo-router';

export function useAppointmentModalParams() {
  const params = useLocalSearchParams();
  // These should match the param names set by the clients page when returning
  const initialClientId = typeof params.selectedClientId === 'string' ? params.selectedClientId : '';
  const initialClientName = typeof params.selectedClientName === 'string' ? params.selectedClientName : '';
  const initialClientPhone = typeof params.selectedClientPhone === 'string' ? params.selectedClientPhone : '';
  const autoOpenDrawer = String(params.openForm) === '1';
  return { initialClientId, initialClientName, initialClientPhone, autoOpenDrawer };
}
