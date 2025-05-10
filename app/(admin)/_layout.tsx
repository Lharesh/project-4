// app/(admin)/_layout.tsx
import { Stack } from 'expo-router';
import { COLORS } from '@/constants/theme';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
