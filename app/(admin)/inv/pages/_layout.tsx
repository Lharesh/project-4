import { Stack } from 'expo-router';

export default function InventoryStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Inventory' }} />
      <Stack.Screen name="add" options={{ title: 'Add/Edit Item' }} />
      <Stack.Screen name="reorder" options={{ title: 'Reorder Items' }} />
      <Stack.Screen name="upload" options={{ title: 'Upload Excel' }} />
      <Stack.Screen name="upload-failures" options={{ title: 'Upload Failures' }} />
    </Stack>
  );
}
