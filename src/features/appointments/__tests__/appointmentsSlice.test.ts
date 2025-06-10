import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import appointmentsReducer, {
  addAppointment,
  addAppointments,
  setAppointments,
  clearAppointments,
  clearAppointmentsError
} from '../appointmentsSlice';

describe('appointmentsSlice', () => {
  const initialState = {
    appointments: [],
    isLoading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(appointmentsReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle addAppointment', () => {
    const newAppointment = { id: 'a1', clientId: 'p1', clientName: 'Amit', date: '2025-06-01', time: '10:00', status: 'scheduled' as const, tab: 'Doctor' as const };
    const nextState = appointmentsReducer(initialState, addAppointment(newAppointment));
    expect(nextState.appointments).toContainEqual(newAppointment);
  });

  it('should handle addAppointments', () => {
    const newAppointments = [
      { id: 'a2', clientId: 'p2', clientName: 'Sunita', date: '2025-06-02', time: '09:00', status: 'scheduled' as const, tab: 'Therapy' as const },
      { id: 'a3', clientId: 'p3', clientName: 'Ravi', date: '2025-06-02', time: '11:00', status: 'scheduled' as const, tab: 'Doctor' as const }
    ];
    const nextState = appointmentsReducer(initialState, addAppointments(newAppointments));
    expect(nextState.appointments).toEqual(expect.arrayContaining(newAppointments));
  });

  it('should handle setAppointments', () => {
    const appointments = [
      { id: 'a4', clientId: 'p4', clientName: 'Sita', date: '2025-06-03', time: '12:00', status: 'scheduled' as const, tab: 'Therapy' as const }
    ];
    const nextState = appointmentsReducer(initialState, setAppointments(appointments));
    expect(nextState.appointments).toEqual(appointments);
  });

  it('should handle clearAppointments', () => {
    const stateWithAppointments = {
      ...initialState,
      appointments: [
        { id: 'a5', clientId: 'p5', clientName: 'Manoj', date: '2025-06-04', time: '13:00', status: 'completed' as const, tab: 'Doctor' as const }
      ]
    };
    const nextState = appointmentsReducer(stateWithAppointments, clearAppointments());
    expect(nextState.appointments).toEqual([]);
  });

  it('should handle clearAppointmentsError', () => {
    const stateWithError = {
      ...initialState,
      error: 'Something went wrong',
    };
    const nextState = appointmentsReducer(stateWithError, clearAppointmentsError());
    expect(nextState.error).toBeNull();
  });
});
