import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { store } from '@/redux/store';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <PaperProvider>
      <Provider store={store}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }} initialRouteName="(app)">
          {/* <Stack.Screen name="auth" options={{ headerShown: false }} /> */}
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </Provider>
    </PaperProvider>
  );
}