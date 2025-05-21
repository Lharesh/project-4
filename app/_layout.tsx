import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { Menu, Provider as PaperProvider } from 'react-native-paper';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { store } from '@/redux/store';

import { ReactNode } from 'react';
import AppHeader from './(admin)/clinics/components/AppHeader';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  useFrameworkReady();

  return (
    <PaperProvider>
      <Provider store={store}>
        <StatusBar style="auto" />
        <Stack initialRouteName="(app)">
          {/* <Stack.Screen name="auth" options={{ headerShown: false }} /> */}
          <Stack.Screen
            name="(app)"
            options={{
              header: (props) => <AppHeader title={props.options.title} />,
            }}
          />
          <Stack.Screen
            name="(admin)"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
      </Provider>
      {children}
    </PaperProvider>
  );
}