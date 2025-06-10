import { APPOINTMENT_PARAM_KEYS } from "../constants/paramKeys";
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { store } from '@/redux/store'; // Use the real Redux store

export const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <PaperProvider>
    <Provider store={store}>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </Provider>
  </PaperProvider>
);