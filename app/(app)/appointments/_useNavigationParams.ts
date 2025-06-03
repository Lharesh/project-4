// Helper hook to get navigation params from expo-router and normalize for appointment modal
import { APPOINTMENT_PARAM_KEYS } from '../../../src/features/appointments/constants/paramKeys';
import { useLocalSearchParams } from 'expo-router';

function getString(val: string | string[] | undefined): string {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}
export function useAppointmentModalParams() {
  const params = useLocalSearchParams();
  // These should match the param names set by the clients page when returning
  const initialClientId = getString(params[APPOINTMENT_PARAM_KEYS.CLIENT_ID]);
  const initialClientName = getString(params.clientName);
  const initialClientPhone = getString(params.clientPhone);
  const autoOpenDrawer = !!params.autoOpenDrawer || !!params.select;
  // 'new' param signals intent to open drawer for a new appointment and clear previous data
  const newAppointment = params.new === '1';
  const initialSlotStart = getString(params[APPOINTMENT_PARAM_KEYS.SLOT_START]);
  const initialSlotEnd = getString(params[APPOINTMENT_PARAM_KEYS.SLOT_END]);
  const initialRoomId = getString(params[APPOINTMENT_PARAM_KEYS.ROOM_ID]) || getString(params.slotRoom);
  const initialDate = getString(params[APPOINTMENT_PARAM_KEYS.DATE]);
  return { initialClientId, initialClientName, initialClientPhone, autoOpenDrawer, newAppointment, initialSlotStart, initialSlotEnd, initialRoomId, initialDate };
}
// 'newAppointment': boolean, true if navigation param 'new' is set to 1. Use to clear appointment state and open drawer for new creation.
