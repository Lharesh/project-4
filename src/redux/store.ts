import { configureStore, UnknownAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authReducer, clinicReducer, configReducer, setupReducer } from '@/features/clinicConfig';

import appointmentsReducer from '@/features/appointments/appointmentsSlice';
import clientsReducer from '@/features/clients/clientsSlice';

import { reportsReducer } from '@/features/financial';
import inventoryReducer from '@/features/inventory/inventorySlice';
import { therapyReducer } from '@/features/therapy';

// Persist configuration for reports
const reportsPersistConfig = {
  key: 'reports',
  storage: AsyncStorage,
  whitelist: ['filters'], // Only persist filters 
};

const persistedReportsReducer = persistReducer(reportsPersistConfig, reportsReducer);

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clinic: clinicReducer,
    config: configReducer,
    appointments: appointmentsReducer,
    clients: clientsReducer,
    setup: setupReducer,
    reports: persistedReportsReducer,
    inventory: inventoryReducer,
    scheduleTherapy: therapyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

