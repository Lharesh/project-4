import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchClients } from '@/redux/slices/clientsSlice';
import { Card } from '@/components/ui/Card';
import { COLORS } from '@/constants/theme';
import { ChevronRight, Phone, Mail, Search, Plus } from 'lucide-react-native';

export default function ClientsScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { clients, isLoading } = useAppSelector((state) => state.clients);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.clinicId) {
      dispatch(fetchClients(user.clinicId));
    }
  }, [user?.clinicId]);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    client.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading clients...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={COLORS.neutral[400]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone, or ID"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.neutral[400]}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {filteredClients.map((client) => (
          <Card key={client.id} style={styles.clientCard}>
            <TouchableOpacity
              style={styles.cardContent}
              onPress={() => {
                // Navigate to client details in future
                console.log('Navigate to client:', client.id);
              }}
            >
              <View style={styles.clientInfo}>
                <View style={styles.nameContainer}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.patientId}>ID: {client.patientId}</Text>
                </View>
                
                <View style={styles.contactInfo}>
                  <View style={styles.contactItem}>
                    <Phone size={14} color={COLORS.neutral[500]} />
                    <Text style={styles.contactText}>{client.phone}</Text>
                  </View>
                  <View style={styles.contactItem}>
                    <Mail size={14} color={COLORS.neutral[500]} />
                    <Text style={styles.contactText}>{client.email}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.arrowContainer}>
                <ChevronRight size={20} color={COLORS.neutral[400]} />
              </View>
            </TouchableOpacity>
          </Card>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          // Handle new client
          console.log('New client');
        }}
      >
        <Plus size={24} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral[200],
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.neutral[100],
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  clientCard: {
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clientInfo: {
    flex: 1,
  },
  nameContainer: {
    marginBottom: 8,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
    marginBottom: 2,
  },
  patientId: {
    fontSize: 14,
    color: COLORS.vata[600],
    fontWeight: '500',
  },
  contactInfo: {
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  arrowContainer: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.vata[500],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export const options = {
  title: 'Clients',
};