import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const SETUP_ITEMS = [
  { label: 'Clinic Timings', route: '/clinics/setup/clinic-timings' },
  { label: 'Treatment Slots', route: '/clinics/setup/treatment-slots' },
  { label: 'Staff Management', route: '/clinics/setup/staff-management' },
  { label: 'User Roles', route: '/clinics/setup/user-roles' },
  { label: 'WhatsApp Templates', route: '/clinics/setup/whatsapp-templates' },
];



export default function SetupLanding() {
  const router = useRouter();
  return (
    <>
            <ScrollView contentContainerStyle={styles.container}>
        {SETUP_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.item}
            onPress={() => router.push(item.route as any)}
          >
            <Text style={styles.itemText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#222',
  },
  item: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  itemText: {
    fontSize: 18,
    color: '#222',
  },
});


