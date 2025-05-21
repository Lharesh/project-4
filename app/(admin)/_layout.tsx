import React, { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminLayout() {
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();

  const menuItems = [
    { title: 'Dashboard', route: '@/featues/superadmin/dashboard' },
    { title: 'Settings', route: './settings' },
    { title: 'Logout', route: './logout' },
  ];

  return (
    <>
      <Stack
        screenOptions={({ route }) => {
          if (route.name.startsWith('clinics/setup')) {
            return { header: () => null };
          }
          if (route.name.startsWith('superadmin')) {
            return { header: () => null };
          }
          return {
            header: (props) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'yellow' }}>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                  <MaterialIcons name="menu" size={24} color="red" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, marginLeft: 16 }}>{props.options.title ?? props.route.name}</Text>
              </View>
            ),
          };
        }}
      >
        {/* ...your Stack.Screen definitions... */}
      </Stack>
      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
                <View style={{
                  marginTop: 60,
                  marginLeft: 16,
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
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}