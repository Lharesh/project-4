import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore as realConfigureStore } from '@reduxjs/toolkit';
import clientsReducer from '../clientsSlice';
import configureStore from 'redux-mock-store';
import ClientsScreen from '../../../../app/(app)/clients';
import { initialState as clientsInitialState } from '../clientsSlice';

const mockStore = configureStore([]);

function renderWithStore(storeState = {}, realStore = false) {
  let store;
  if (realStore) {
    store = realConfigureStore({
      reducer: { clients: clientsReducer },
      preloadedState: { clients: { ...clientsInitialState, ...storeState } },
    });
  } else {
    store = configureStore([])({
      clients: { ...clientsInitialState, ...storeState },
    });
  }
  return render(
    <Provider store={store}>
      <ClientsScreen />
    </Provider>
  );
}

describe('ClientsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays empty state when no clients are present', () => {
    const { getByText } = renderWithStore({ clients: [] });
    expect(getByText("You don't have any clients added yet.")).toBeTruthy();
  });

  it('filters the client list by search', async () => {
    const clients = [
      { id: '1', name: 'Alice', mobile: '1234567890' },
      { id: '2', name: 'Bob', mobile: '9876543210' },
    ];
    const { getByPlaceholderText, getByText, queryByText } = renderWithStore({ clients });
    const searchInput = getByPlaceholderText('Search by name, phone, or ID');
    fireEvent.changeText(searchInput, 'Bob');
    await waitFor(() => {
      expect(getByText('Bob')).toBeTruthy();
      expect(queryByText('Alice')).toBeNull();
    });
  });

  it('opens Add Client modal and fills out form fields', async () => {
    const { getByPlaceholderText, getByTestId } = renderWithStore();
    fireEvent.press(getByTestId('add-client-button'));
    const nameInput = getByPlaceholderText('Name');
    const mobileInput = getByPlaceholderText('Mobile');
    fireEvent.changeText(nameInput, 'Charlie');
    fireEvent.changeText(mobileInput, '5551234567');
    expect(nameInput.props.value).toBe('Charlie');
    expect(mobileInput.props.value).toBe('5551234567');
  });

  it('submits the form and updates state/UI', async () => {
    const { getByText, getByPlaceholderText, queryByText, getByTestId } = renderWithStore({ clients: [] }, true);
    fireEvent.press(getByTestId('add-client-button'));
    fireEvent.changeText(getByPlaceholderText('Name'), 'Dana');
    fireEvent.changeText(getByPlaceholderText('Mobile'), '8889990000');
    // Save by pressing the Save icon button (find by testID)
    fireEvent.press(getByTestId('save-client-button'));
    await waitFor(() => {
      expect(queryByText('No clients found')).toBeNull();
      expect(getByText('Dana')).toBeTruthy();
    });
  });

  it('shows validation errors for missing/invalid fields', async () => {
    const { getByText, getByPlaceholderText, getByTestId } = renderWithStore();
    fireEvent.press(getByTestId('add-client-button'));
    // Try to save without filling fields
    fireEvent.press(getByTestId('save-client-button'));
    await waitFor(() => {
      expect(getByText('Name must be at least 2 characters')).toBeTruthy();
      expect(getByText('Mobile number must be 10 digits')).toBeTruthy();
    });
    fireEvent.changeText(getByPlaceholderText('Name'), 'Eve');
    fireEvent.changeText(getByPlaceholderText('Mobile'), 'badnumber');
    fireEvent.press(getByTestId('save-client-button'));
    await waitFor(() => {
      expect(getByText('Mobile number must be 10 digits')).toBeTruthy();
    });
  });
});
