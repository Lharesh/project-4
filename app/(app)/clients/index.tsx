import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '@/theme/constants/theme';
import { clientStyles } from './client.styles';
import AppSwitch from '@/components/ui/AppSwitch';

const textStyles = {
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: COLORS.vata[900],
    textAlign: 'center' as const,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.vata[500],
    textAlign: 'center' as const,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.white,
    textAlign: 'center' as const,
  },
};
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/theme';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchClients,
  addClient,
  updateClient,
} from '@/features/clients/clientsSlice';
import { APPOINTMENT_PARAM_KEYS } from '@/features/appointments/constants/paramKeys';
import Card from '@/components/ui/Card';
import AppTextField from '@/components/ui/AppTextField';
import FormContainer from '@/components/ui/FormContainer';
import FormFieldRow from 'src/components/ui/FormFieldRow';
import { ChevronRight, Phone, Mail, Search, Plus, UserPlus2, Save as SaveIcon, X as CancelIcon } from 'lucide-react-native';
import type { Client } from '@/features/clients/types/client';

const EMPTY_CLIENT: Client & { mobileCode: string; altMobileCode: string; prefix?: string } = {
  id: '',
  prefix: 'Mr.',
  name: '',
  mobile: '',
  altMobile: '',
  mobileCode: '+91',
  altMobileCode: '+91',
  gender: 'Male',
  email: '',
  dob: '',
  height: undefined,
  weight: undefined,
  presentComplaints: '',
  knownIssues: [],
  pastIllnesses: '',
  allergies: '',
  familyHistory: '',
  currentMedication: '',
  age: 0,
};


const GENDER_OPTIONS: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Other'];

function calculateAge(dob?: string): number {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  return years > 0 ? years : 0;
}

function ClientsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectMode = String(params.select) === '1';

  const handleSelectClient = (client: Client) => {
    if (selectMode) {
      router.push({
        pathname: '/appointments/booking',
        params: {
          ...params,
          [APPOINTMENT_PARAM_KEYS.CLIENT_ID]: client.id,
          [APPOINTMENT_PARAM_KEYS.CLIENT_NAME]: client.name,
          [APPOINTMENT_PARAM_KEYS.CLIENT_MOBILE]: client.mobile,
          [APPOINTMENT_PARAM_KEYS.SLOT_START]: params[APPOINTMENT_PARAM_KEYS.SLOT_START],
          [APPOINTMENT_PARAM_KEYS.SLOT_END]: params[APPOINTMENT_PARAM_KEYS.SLOT_END],
          [APPOINTMENT_PARAM_KEYS.ROOM_ID]: params[APPOINTMENT_PARAM_KEYS.ROOM_ID] || params.slotRoom,
          slotRoom: params.slotRoom,
          [APPOINTMENT_PARAM_KEYS.DATE]: params[APPOINTMENT_PARAM_KEYS.DATE],
          tab: 'Therapy',
          t: Date.now(),
        }
      });
    } else {
      // ...existing logic for non-select mode
    }
  };

  const [showDatePicker, setShowDatePicker] = useState(false);
  const dispatch = useAppDispatch();

  const clientsState = useAppSelector(state => state.clients);
  const clients = clientsState.clients;
  const loading = clientsState.isLoading;
  const error: string | null = clientsState.error;
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  type ClientForm = Partial<Client> & { mobileCode: string; altMobileCode: string; prefix?: string };
  const [form, setForm] = useState<ClientForm>({
    id: '',
    prefix: 'Mr.',
    name: '',
    mobile: '',
    altMobile: '',
    mobileCode: '+91',
    altMobileCode: '+91',
    gender: 'Male',
    email: '',
    dob: '',
    height: undefined,
    weight: undefined,
    presentComplaints: '',
    knownIssues: [],
    pastIllnesses: '',
    allergies: '',
    familyHistory: '',
    currentMedication: '',
    age: 0,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) errors.mobile = 'Mobile number must be 10 digits';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Invalid email';
    if (form.height && Number(form.height) <= 0) errors.height = 'Height must be positive';
    return errors;
  };

  const handleFormChange = (field: string, value: any) => {
    setForm((prev) => {
      let newForm = { ...prev };
      if (field === 'dob') {
        newForm.dob = value;
        newForm.age = calculateAge(value);
      } else if (field === 'age') {
        newForm.age = value === '' ? 0 : Number(value);
      } else {
        (newForm as any)[field] = value;
      }
      return newForm;
    });
  };


  const handleSubmit = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const fullMobile = (form.mobileCode || '+91') + (form.mobile || '');
    const fullAltMobile = form.altMobile ? (form.altMobileCode || '+91') + form.altMobile : '';

    const idPrefix = 'Client ';
    const maxIdNum = clients
      .map((c: any) => (typeof c.id === 'string' && c.id.startsWith(idPrefix)) ? parseInt(c.id.replace(idPrefix, '')) : 1000)
      .filter((n: number) => !isNaN(n))
      .reduce((max: number, n: number) => Math.max(max, n), 1000);

    let clientData = {
      ...form,
      id: form.id && clients.some((c: any) => c.id === form.id)
        ? form.id
        : idPrefix + (maxIdNum + 1),
      gender: (form.gender as 'Male' | 'Female' | 'Other') || 'Male',
      name: form.name || '',
      mobile: fullMobile,
      altMobile: fullAltMobile,
    };

    try {
      if (form.id && clients.some((c: any) => c.id === form.id)) {
        console.log('[UI] Dispatching upAPPOINTMENT_PARAM_KEYS.DATEClient with:', clientData);
        // If dob is provided, calculate age; otherwise, use age from form (must be number)
        const age = clientData.dob ? calculateAge(clientData.dob) : (typeof clientData.age === 'number' ? clientData.age : 0);
        dispatch(updateClient({
          ...clientData,
          age,
          email: clientData.email || '',
          dob: clientData.dob || '',
          presentComplaints: clientData.presentComplaints || '',
          knownIssues: clientData.knownIssues || [],
          pastIllnesses: clientData.pastIllnesses || '',
          allergies: clientData.allergies || '',
          familyHistory: clientData.familyHistory || '',
          currentMedication: clientData.currentMedication || '',
        }));
        setModalVisible(false);
        setForm(EMPTY_CLIENT);
        setFormErrors({});
      } else {
        console.log('[UI] Dispatching addClient with:', clientData);
        // If dob is provided, calculate age; otherwise, use age from form (must be number)
        const age = clientData.dob ? calculateAge(clientData.dob) : (typeof clientData.age === 'number' ? clientData.age : 0);
        dispatch(addClient({
          ...clientData,
          age,
          email: clientData.email || '',
          dob: clientData.dob || '',
          presentComplaints: clientData.presentComplaints || '',
          knownIssues: clientData.knownIssues || [],
          pastIllnesses: clientData.pastIllnesses || '',
          allergies: clientData.allergies || '',
          familyHistory: clientData.familyHistory || '',
          currentMedication: clientData.currentMedication || '',
        }));
        setModalVisible(false);
        setForm(EMPTY_CLIENT);
        setFormErrors({});
      }
    } catch (e) {
      // Optionally handle error
    }
  };

  const filteredClients = clients
    .slice()
    .sort((a: any, b: any) => {
      const getIdNum = (id: string) => {
        if (typeof id !== 'string') return 0;
        if (id.startsWith('Client ')) return parseInt(id.replace('Client ', ''));
        return 0;
      };
      return getIdNum(b.id) - getIdNum(a.id);
    })
    .filter(
      (client: any) =>
        typeof client.name === 'string' && client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof client.mobile === 'string' && client.mobile.includes(searchQuery)) ||
        (typeof client.id === 'string' && client.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <>
      <SafeAreaView style={clientStyles.container} edges={['top', 'bottom', 'left', 'right']}>
        <FormContainer>
          {/* Main Content */}
          {/* Search Bar */}
          <FormFieldRow>
            <AppTextField
              label="Search"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, phone, or ID"
            />
          </FormFieldRow>
          {!loading && filteredClients.length === 0 ? (
            <View style={clientStyles.emptyContainer}>
              <UserPlus2 size={48} color={colors.vata.primary} />
              <Text style={clientStyles.emptyText}>You don't have any clients added yet.</Text>
            </View>
          ) : (
            <ScrollView>
              {filteredClients.map((client: Client) => (
                <Card key={client.id} style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={() => {
                      if (selectMode) {
                        handleSelectClient(client);
                      }
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                  >
                    <Text style={clientStyles.clientName}>{client.name}</Text>
                    <Text style={clientStyles.clientId}>{client.id}</Text>
                  </TouchableOpacity>
                </Card>
              ))}
            </ScrollView>
          )}
        </FormContainer>
      </SafeAreaView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        transparent={false}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {/* ...modal form fields and buttons... */}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <TouchableOpacity style={clientStyles.addButton} onPress={() => setModalVisible(true)} accessibilityLabel="Add Client">
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </>
  );
}

export default ClientsScreen;
