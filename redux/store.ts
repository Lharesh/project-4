import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import clinicReducer from './slices/clinicSlice';
import configReducer from './slices/configSlice';
import appointmentsReducer from './slices/appointmentsSlice';
import clientsReducer from './slices/clientsSlice';
import setupReducer from './slices/setupSlice';
import reportsReducer from './slices/reportsSlice';

// Persist configuration for reports
const reportsPersistConfig = {
  key: 'reports',
  storage,
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
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;