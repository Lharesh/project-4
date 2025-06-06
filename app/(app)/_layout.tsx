import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import { Tabs, router, useSegments, usePathname } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchClinic } from 'app/(admin)/clinics/clinicSlice';
import { fetchConfig } from '@/features/clinicConfig/configSlice';
import { COLORS } from '@/theme/constants/theme';
import Card from '@/components/ui/Card';
import { ROLE_TABS } from '@/constants/roleConfig';
import { ROUTE_APPOINTMENTS } from '@/constants/routes';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  // const { isAuthenticated, user } = useAppSelector((state) => state.auth); // [LOGIN BYPASS] Commented for no-login mode
  // [LOGIN BYPASS] Fake user for bypassing login
  const user = { role: 'admin' }; // Set role as needed for testing

  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const segments = useSegments();
  const pathname = usePathname();

  const role = (user?.role || 'admin').toLowerCase();
  const roleTabs = ROLE_TABS[role] || [];

  const mainTabs = roleTabs
    .filter((tab) => tab.type === 'main' && ['appointments', 'clients'].includes(tab.name))
    .sort((a, b) => {
      const order = ['appointments', 'clients'];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });

  const adminTabs = roleTabs.filter((tab) => tab.type === 'admin');

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      // [LOGIN BYPASS] Auth redirect disabled for demo/testing
      dispatch(fetchClinic());
      dispatch(fetchConfig());
      if (segments.join('/') === '(app)') {
        router.replace(ROUTE_APPOINTMENTS);
      }
    });
    return () => task.cancel();
  }, [user?.role]);

  const toggleAdminMenu = () => setShowAdminMenu(!showAdminMenu);

  // if (!user?.role) return null; // [LOGIN BYPASS] Hide auth check for no-login mode

  return (
    <>
      {adminTabs.length > 0 && showAdminMenu && (
        <View style={[styles.adminMenuOverlay, { position: 'absolute', top: 60, right: 10, zIndex: 9999 }]}> {/* Adjust top/right as needed */}
          <TouchableOpacity
            style={styles.adminMenuBackdrop}
            onPress={() => setShowAdminMenu(false)}
          />
          <Card style={styles.adminMenu}>
            {adminTabs.map((item) => (
              <TouchableOpacity
                key={item.route}
                style={styles.adminMenuItem}
                onPress={() => {
                  if (item.route) {
                    router.push((item.route.startsWith('/') ? item.route : `/${item.route}`) as any);
                    setShowAdminMenu(false);
                  }
                }}
              >
                <Text style={styles.adminMenuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      )}
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.vata[600],
          tabBarInactiveTintColor: COLORS.neutral[400],
          tabBarStyle: {
            borderTopWidth: 1,
            backgroundColor: '#FFD600',
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerShown: false,
        }}
      >
        {mainTabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={`${tab.name}/index`} // ✅ Match the folder structure exactly
            options={{
              title: tab.title, // sets the tab title correctly
              tabBarIcon: ({ color, size }: { color: string; size: number }) =>
                React.createElement(tab.icon, { color, size }),
            }}
          />
        ))}
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    padding: 12,
  },
  adminMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  adminMenuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  adminMenu: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 200,
    padding: 0,
    overflow: 'hidden',
  },
  adminMenuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  adminMenuText: {
    fontSize: 16,
    color: COLORS.neutral[800],
  },
});