import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';

import { useLocalSearchParams } from 'expo-router';

interface AppHeaderProps {
  title?: string;
}

function getFriendlyTitle(routeName: string | undefined) {
  // Add more mappings as needed
  switch (routeName) {
    case 'appointments':
      return 'Appointments';
    case 'clients':
      return 'Clients';
    case 'setups':
      return 'Setups';
    case 'dashboard':
      return 'Dashboard';
    default:
      // Capitalize first letter as fallback
      return routeName ? routeName.charAt(0).toUpperCase() + routeName.slice(1) : '';
  }
}

export default function AppHeader({ title }: AppHeaderProps) {
  const menuIconRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 60, right: 16 });
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const segments = useSegments() as string[];
  const params = useLocalSearchParams();
  // If segments length is 2 or less, it's likely a root screen (adjust as needed for your structure)
  // Make back button logic robust to any nesting (e.g. (admin)/clinics/setup/* or (admin)/superadmin/*)
  const setupIndex = segments.indexOf('setup');
  const superadminIndex = segments.indexOf('superadmin');
  const isSetupLanding = setupIndex !== -1 && segments.length === setupIndex + 1;
  const isSetupSubpage = setupIndex !== -1 && segments.length > setupIndex + 1;
  const isSuperadminPage = superadminIndex !== -1;
  const showBackButton = isSetupLanding || isSetupSubpage || isSuperadminPage;

  // Determine the route name (last segment)
  const routeName = segments.length > 0 ? segments[segments.length - 1] : undefined;
  const displayTitle = title || getFriendlyTitle(routeName);

  const menuItems = [
    { title: 'Setups', route: '/clinics/setup'},
    { title: 'Dashboard', route: '/superadmin/dashboard' },
  ];

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFD600' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {showBackButton && (
          <TouchableOpacity
            onPress={() => {
              if (isSetupLanding || isSuperadminPage) {
                router.replace('/appointments');
              } else if (isSetupSubpage) {
                router.replace('/clinics/setup');
              }
            }}
            style={{ marginRight: 8 }}
          >
            <MaterialIcons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        )}
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{displayTitle}</Text>
      </View>
      {/* Menu icon with ref for positioning */}
      <TouchableOpacity
        ref={menuIconRef}
        onPress={() => {
          if (menuIconRef.current && 'measureInWindow' in menuIconRef.current) {
            (menuIconRef.current as any).measureInWindow((x: number, y: number, width: number, height: number) => {
              const screenWidth = Dimensions.get('window').width;
              setMenuPosition({
                top: y + height,
                right: screenWidth - (x + width),
              });
              setMenuVisible(true);
            });
          } else {
            setMenuVisible(true);
          }
        }}
      >
        <MaterialIcons name="menu" size={24} color="black" />
      </TouchableOpacity>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={{
            position: 'absolute',
            top: menuPosition.top,
            right: menuPosition.right,
            backgroundColor: 'white',
            borderRadius: 8,
            elevation: 4,
            paddingVertical: 8,
            minWidth: 160,
          }}>
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.route}
                onPress={() => {
                  setMenuVisible(false);
                  router.push(item.route as any);
                }}
                style={{ padding: 12 }}
              >
                <Text style={{ fontSize: 16 }}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
