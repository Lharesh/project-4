import React, { useEffect, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '@/constants/theme';
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
import Card from '@/components/ui/Card';
import AppTextField from '@/components/ui/AppTextField';
import FormContainer from '@/components/ui/FormContainer';
import FormFieldRow from 'src/components/ui/FormFieldRow';
import { PrefixPicker } from '@/features/clients/components/PrefixPicker';
import { CountryCodePicker } from '@/features/clients/components/CountryCodePicker';
import { GenericDatePicker } from 'src/components/ui/GenericDatePicker';
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dispatch = useAppDispatch();

const clientsState = useAppSelector(state => state.clients);
  const clients = clientsState.clients;
  const loading = clientsState.isLoading;
  const error: string | null = clientsState.error;
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  type ClientForm = Partial<Client> & { mobileCode: string; altMobileCode: string; prefix?: string }; // age is always number, not string
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

  const handleKnownIssuesChange = (issue: string) => {
    setForm((prev) => {
      const knownIssues = prev.knownIssues || [];
      if (knownIssues.includes(issue)) {
        return { ...prev, knownIssues: knownIssues.filter((i) => i !== issue) };
      } else {
        return { ...prev, knownIssues: [...knownIssues, issue] };
      }
    });
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!form.mobile || !/^\d{10}$/.test(form.mobile)) errors.mobile = 'Mobile number must be 10 digits';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) errors.email = 'Invalid email';
    if (form.height && Number(form.height) <= 0) errors.height = 'Height must be positive';
    if (form.weight && Number(form.weight) <= 0) errors.weight = 'Weight must be positive';
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
        console.log('[UI] Dispatching updateClient with:', clientData);
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
                    onPress={() => { /* Future: open client detail */ }}
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', fontSize: 16 }}>{client.name}</Text>
                      <Text style={{ color: colors.gray, fontSize: 14 }}>
                        Mobile: {client.mobile}
                      </Text>
                    </View>
                    <ChevronRight size={20} color={colors.gray} />
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
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[clientStyles.modalOverlay, { padding: 10, backgroundColor: '#fff' }]} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-start', paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={textStyles.formTitle}>New Patient</Text>
            </View>
            <FormFieldRow>
              <TextInput
                value={form.name || ''}
                onChangeText={(v: string) => handleFormChange('name', v)}
                placeholder="* Name"
                style={clientStyles.input}
              />
              {formErrors.name ? (
                <Text style={clientStyles.errorText}>{formErrors.name}</Text>
              ) : null}
            </FormFieldRow>
            {/* Row 2: Mobile */}
            <FormFieldRow style={clientStyles.mobileRow}>
              <View style={clientStyles.codePickerWrapper}>
                <CountryCodePicker
                  value={form.mobileCode || '+91'}
                  onChange={(code: string) => handleFormChange('mobileCode', code)}
                />
              </View>
              <TextInput
                value={form.mobile || ''}
                onChangeText={(v: string) => handleFormChange('mobile', v.replace(/[^0-9]/g, ''))}
                placeholder="Mobile"
                style={clientStyles.input}
                keyboardType="numeric"
              />
            </FormFieldRow>
            {formErrors.mobile ? (
              <Text style={clientStyles.errorText}>{formErrors.mobile}</Text>
            ) : null}
            {/* Row 3: Alternate Mobile */}
            <FormFieldRow style={clientStyles.mobileRow}>
              <View style={clientStyles.codePickerWrapper}>
                <CountryCodePicker
                  value={form.altMobileCode || '+91'}
                  onChange={(code: string) => handleFormChange('altMobileCode', code)}
                />
              </View>
              <TextInput
                value={form.altMobile || ''}
                onChangeText={(v: string) => handleFormChange('altMobile', v.replace(/[^0-9]/g, ''))}
                placeholder="Alt Mobile"
                style={clientStyles.input}
                keyboardType="numeric"
              />
            </FormFieldRow>
            {/* Row 4: Gender */}
            <FormFieldRow style={{ marginBottom: 12 }}>
              <AppSwitch
                value={form.gender === 'Female' ? 'Female' : 'Male'}
                options={['Male', 'Female']}
                label="Gender:"
                onValueChange={(g: 'Male' | 'Female') => handleFormChange('gender', g)}
              />
            </FormFieldRow>
            {/* Row 5: Date of Birth & Age */}
            <FormFieldRow style={{ marginBottom: 12 }}>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={form.dob || ''}
                  onChange={e => handleFormChange('dob', e.target.value)}
                  style={{
                    flex: 1,
                    border: '1px solid #b1aaff',
                    borderRadius: 8,
                    height: 44,
                    padding: '0 12px',
                    fontSize: 15,
                    fontFamily: 'System',
                    marginRight: 8,
                  }}
                />
              ) : (
                <TouchableOpacity
                  style={[
                    clientStyles.input,
                    {
                      flex: 1,
                      marginRight: 8,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderColor: COLORS.vata[500],
                      height: 44, // match Age field height
                      paddingVertical: 0,
                      paddingHorizontal: 12,
                    },
                  ]}
                  onPress={() => setShowDatePicker(true)}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    flex: 1,
                    color: form.dob ? COLORS.neutral[900] : COLORS.neutral[400],
                    fontSize: 15,
                    fontFamily: 'System',
                  }}>
                    {form.dob ? form.dob : 'DOB'}
                  </Text>
                  <View style={{ paddingHorizontal: 6 }}>
                    <Text style={{ fontSize: 20 }}>📅</Text>
                  </View>
                </TouchableOpacity>
              )}
              {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker
                  value={form.dob ? new Date(form.dob) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      handleFormChange('dob', selectedDate.toISOString().slice(0, 10));
                    }
                  }}
                />
              )}
              <TextInput
                value={form.age ? String(form.age) : ''}
                onChangeText={(v: string) => handleFormChange('age', v.replace(/[^0-9]/g, ''))}
                placeholder="*Age"
                style={[clientStyles.input, { flex: 1 }]}
                keyboardType="number-pad"
                maxLength={3}
              />
              {formErrors.age ? (
                <Text style={clientStyles.errorText}>{formErrors.age}</Text>
              ) : null}
            </FormFieldRow>
            {/* Row 6: Height & Weight */}
            <FormFieldRow style={{ marginBottom: 12 }}>
              <TextInput
                value={String(form.height || '')}
                onChangeText={(v: string) => handleFormChange('height', v)}
                placeholder="Height"
                style={[clientStyles.input, { marginRight: 8, boxSizing: 'border-box', width: '100%' }]}
                keyboardType="numeric"
              />
              {formErrors.height ? (
                <Text style={clientStyles.errorText}>{formErrors.height}</Text>
              ) : null}
              <TextInput
                value={String(form.weight || '')}
                onChangeText={(v: string) => handleFormChange('weight', v)}
                placeholder="Weight"
                style={[clientStyles.input, { boxSizing: 'border-box', width: '100%' }]}
                keyboardType="numeric"
              />
              {formErrors.weight ? (
                <Text style={clientStyles.errorText}>{formErrors.weight}</Text>
              ) : null}
            </FormFieldRow>
            {/* Row 7: Present Complaints */}
            <FormFieldRow>
              <TextInput
                value={form.presentComplaints || ''}
                onChangeText={(v: string) => handleFormChange('presentComplaints', v)}
                placeholder="Present Complaints"
                multiline
                style={[clientStyles.input, { minHeight: 60, maxHeight: 120, textAlignVertical: 'top' }]}
              />
            </FormFieldRow>
            <FormFieldRow style={{ marginBottom: 16 }} />
            <FormFieldRow>
              <TextInput
                value={form.pastIllnesses || ''}
                onChangeText={(v: string) => handleFormChange('pastIllnesses', v)}
                placeholder="Past Illnesses"
                multiline
                style={[clientStyles.input, { minHeight: 60, maxHeight: 120, textAlignVertical: 'top' }]}
              />
            </FormFieldRow>
            <FormFieldRow style={{ marginBottom: 16 }} />
            <FormFieldRow>
              <TextInput
                value={form.allergies || ''}
                onChangeText={(v: string) => handleFormChange('allergies', v)}
                placeholder="Allergies"
                multiline
                style={[clientStyles.input, { minHeight: 60, maxHeight: 120, textAlignVertical: 'top' }]}
              />
            </FormFieldRow>
            <FormFieldRow style={{ marginBottom: 16 }} />
            <FormFieldRow>
              <TextInput
                value={form.currentMedication || ''}
                onChangeText={(v: string) => handleFormChange('currentMedication', v)}
                placeholder="Current Medication"
                multiline
                style={[clientStyles.input, { minHeight: 60, maxHeight: 120, textAlignVertical: 'top' }]}
              />
            </FormFieldRow>
            <FormFieldRow style={{ marginBottom: 24 }} />

            {/* Row 11: Buttons */}
            <FormFieldRow>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  style={[
                    clientStyles.modalButton,
                    {
                      flex: 1,
                      backgroundColor: COLORS.white,
                      borderColor: COLORS.vata[500],
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => { setModalVisible(false); setForm(EMPTY_CLIENT); setFormErrors({}); }}
                >
                  <Text style={[
                    textStyles.cancelButtonText,
                    {
                      color: COLORS.vata[500],
                      fontFamily: typography.fontFamily,
                      fontSize: typography.fontSizeMd,
                    },
                  ]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    clientStyles.modalButton,
                    {
                      flex: 1,
                      backgroundColor: COLORS.vata[500],
                      borderColor: COLORS.vata[500],
                      borderWidth: 1,
                    },
                  ]}
                  onPress={handleSubmit}
                >
                  <Text style={[
                    textStyles.saveButtonText,
                    {
                      color: COLORS.white,
                      fontFamily: 'System',
                      fontSize: 15,
                    },
                  ]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </FormFieldRow>
          </ScrollView>
        </SafeAreaView>
      </Modal >
      <TouchableOpacity style={clientStyles.addButton} onPress={() => setModalVisible(true)} accessibilityLabel="Add Client">
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </>
  );
}
export default ClientsScreen;