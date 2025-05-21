import React from 'react';
import { useSegments, Slot } from 'expo-router';
import AppHeader from '../components/AppHeader';

const TITLE_MAP = {
  'clinic-timings': 'Clinic Timings',
  'treatment-slots': 'Treatment Slots',
  'staff-management': 'Staff Management',
  'user-roles': 'User Roles',
  'whatsapp-templates': 'WhatsApp Templates',
  'index': 'Setups',
};

export default function SetupLayout() {
  const segments = useSegments();
  const lastSegment = segments[segments.length - 1] || 'index';
  const title =
    lastSegment in TITLE_MAP
      ? TITLE_MAP[lastSegment as keyof typeof TITLE_MAP]
      : 'Setups';

  return (
    <>
      <AppHeader title={title} />
      <Slot />
    </>
  );
}
