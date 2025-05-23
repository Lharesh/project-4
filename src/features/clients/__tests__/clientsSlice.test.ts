import reducer, {
  addClient,
  updateClient,
  clearClientsError,
  fetchClients
} from '../clientsSlice';

import { initialState } from '../clientsSlice';

describe('clientsSlice', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  it('should handle addClient', () => {
    const newClient = {
  id: '1',
  name: 'Test',
  mobile: '1234567890',
  altMobile: '',
  mobileCode: '+91',
  altMobileCode: '+91',
  gender: 'Male' as const,
  email: '',
  dob: '',
  height: undefined,
  weight: undefined,
  presentComplaints: '',
  knownIssues: [],
  pastIllnesses: '',
  allergies: '',
  familyHistory: '',
  currentMedication: ''
};
    const state = reducer(initialState, addClient(newClient));
    expect(state.clients).toContainEqual(newClient);
  });

  it('should handle updateClient (existing)', () => {
    const existing = {
  id: '1',
  name: 'Old',
  mobile: '1234567890',
  altMobile: '',
  mobileCode: '+91',
  altMobileCode: '+91',
  gender: 'Male' as const,
  email: '',
  dob: '',
  height: undefined,
  weight: undefined,
  presentComplaints: '',
  knownIssues: [],
  pastIllnesses: '',
  allergies: '',
  familyHistory: '',
  currentMedication: ''
};
    const updated = { ...existing, name: 'Updated' };
    const state = reducer({ ...initialState, clients: [existing] }, updateClient(updated));
    expect(state.clients[0].name).toBe('Updated');
  });

  it('should handle updateClient (non-existing)', () => {
    const emptyState = { ...initialState, clients: [] };
  const state = reducer(emptyState, updateClient({
  id: '999',
  name: 'X',
  mobile: '0',
  altMobile: '',
  mobileCode: '+91',
  altMobileCode: '+91',
  gender: 'Other' as const,
  email: '',
  dob: '',
  height: undefined,
  weight: undefined,
  presentComplaints: '',
  knownIssues: [],
  pastIllnesses: '',
  allergies: '',
  familyHistory: '',
  currentMedication: ''
}));
    expect(state.clients).toHaveLength(0);
  });

  it('should handle clearClientsError', () => {
    const state = reducer({ ...initialState, error: 'Some error' }, clearClientsError());
    expect(state.error).toBeNull();
  });

  it('should handle fetchClients.pending', () => {
    const action = { type: fetchClients.pending.type };
    const state = reducer(initialState, action);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchClients.fulfilled', () => {
    const clients = [{ id: '1', name: 'A', mobile: '123', gender: 'Male' }];
    const action = { type: fetchClients.fulfilled.type, payload: clients };
    const state = reducer({ ...initialState, isLoading: true }, action);
    expect(state.isLoading).toBe(false);
    expect(state.clients).toEqual(clients);
  });

  it('should handle fetchClients.rejected', () => {
    const action = { type: fetchClients.rejected.type, payload: 'Failed' };
    const state = reducer({ ...initialState, isLoading: true }, action);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Failed');
  });
});
