import React from 'react';
import AppHeader from '../clinics/components/AppHeader';
import { Stack, useSegments } from 'expo-router';

export default function SuperAdminLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <AppHeader title="Dashboard" />, // Always show 'Dashboard' as title
      }}
    />
  );
}

