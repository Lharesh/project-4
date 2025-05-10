import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  InteractionManager,
} from 'react-native';
import { Tabs, router, useSegments } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchClinic } from '@/redux/slices/clinicSlice';
import { fetchConfig } from '@/redux/slices/configSlice';
import { COLORS } from '@/constants/theme';
import { Settings } from 'lucide-react-native';
import Card from '@/components/ui/Card';
import { ROLE_TABS } from '@/constants/roleConfig';

export default function AppLayout() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const segments = useSegments();

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
      if (!isAuthenticated) {
        router.replace('/auth/login');
      } else {
        dispatch(fetchClinic());
        dispatch(fetchConfig());

        if (segments.join('/') === '(app)') {
          router.replace('/appointments');
        }
      }
    });
    return () => task.cancel();
  }, [isAuthenticated, user?.role]);

  const toggleAdminMenu = () => setShowAdminMenu(!showAdminMenu);

  if (!user?.role) return null;

  return (
    <>
      {adminTabs.length > 0 && showAdminMenu && (
        <View style={styles.adminMenuOverlay}>
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
            borderTopColor: COLORS.neutral[200],
            height: 60,
            paddingBottom: 10,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
          headerStyle: {
            backgroundColor: COLORS.white,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.neutral[200],
          },
          headerTitleStyle: {
            color: COLORS.neutral[900],
            fontSize: 18,
            fontWeight: '600',
          },
          headerRight: () =>
            adminTabs.length > 0 ? (
              <TouchableOpacity onPress={toggleAdminMenu} style={styles.headerButton}>
                <Settings size={24} color={COLORS.neutral[700]} />
              </TouchableOpacity>
            ) : null,
        }}
      >
        {mainTabs.map((tab) => (
          <Tabs.Screen
            key={tab.name}
            name={`${tab.name}/index`} // ✅ Match the folder structure exactly
            options={{
              title: tab.title, // sets the tab title correctly
              tabBarIcon: ({ color, size }) =>
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
