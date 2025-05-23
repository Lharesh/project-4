import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchClients,
  addClient,
  updateClient,
} from '@/features/clients/clientsSlice';
import Card from '@/components/ui/Card';
import { clientStyles } from './client.styles';
import { FormField } from '@/features/clients/components/FormField';
import { PrefixPicker } from '@/features/clients/components/PrefixPicker';
import { CountryCodePicker } from '@/features/clients/components/CountryCodePicker';
import { GenericDatePicker } from '@/utils/GenericDatePicker';
import { COLORS } from '@/constants/theme';
import { ChevronRight, Phone, Mail, Search, Plus, UserPlus2, Save as SaveIcon, X as CancelIcon } from 'lucide-react-native';
import type { Client } from '@/features/clients/types/client';

const EMPTY_CLIENT: Client & { mobileCode: string; altMobileCode: string; age?: string; prefix?: string } = {
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
  age: '',
};

const GENDER_OPTIONS: Array<'Male' | 'Female' | 'Other'> = ['Male', 'Female', 'Other'];

function calculateAge(dob?: string): string {
  if (!dob) return '';
  const birth = new Date(dob);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) years--;
  return years > 0 ? years + ' years' : '';
}




function ClientsScreen() {
  const dispatch = useAppDispatch();
  const clientsState = useAppSelector((state) => state.clients);
  const clients = clientsState.clients;
  const loading = clientsState.isLoading;
  const error = clientsState.error;
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  type ClientForm = Partial<Client> & { mobileCode: string; altMobileCode: string; age?: string; prefix?: string };
  const [form, setForm] = useState<ClientForm>(EMPTY_CLIENT);

  // Checkbox handler for known issues
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

  // useEffect(() => {
  //   dispatch(fetchClients());
  // }, [dispatch]);

  // Validation logic
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
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Compose full mobile numbers
    const fullMobile = (form.mobileCode || '+91') + (form.mobile || '');
    const fullAltMobile = form.altMobile ? (form.altMobileCode || '+91') + form.altMobile : '';

    // Find max id in current clients
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
        dispatch(updateClient({
          ...clientData,
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
        dispatch(addClient({
          ...clientData,
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
    .slice() // copy
    .sort((a: any, b: any) => {
      // Sort by id descending (latest first)
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

  // Debug: log clients and filteredClients on change
  React.useEffect(() => {
    // Optionally log or inspect state here
  }, [clients, filteredClients]);


  return (
    <View style={clientStyles.container}>
      {/* Search Bar */}
      <View style={{ marginBottom: 8 }}>
        <FormField
          label="Search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, phone, or ID"
        />
      </View>
      {!loading && filteredClients.length === 0 ? (
        <View style={clientStyles.emptyContainer}>
          <UserPlus2 size={48} color={COLORS.vata[500]} />
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
                  <Text style={{ color: COLORS.neutral[500], fontSize: 14 }}>
                    Mobile: {client.mobile}
                  </Text>
                </View>
                <ChevronRight size={20} color={COLORS.neutral[500]} />
              </TouchableOpacity>
            </Card>
          ))}
        </ScrollView>
      )}

      {/* Add Client Button */}
      <TouchableOpacity
        style={clientStyles.addButton}
        onPress={() => {
          setModalVisible(true);
        }}
        activeOpacity={0.85}
        testID="add-client-button"
      >
        <Plus size={24} color={'#fff'} />
      </TouchableOpacity>

      {/* Add/Update Client Modal */}
      <Modal
        visible={modalVisible}
        animationType={Platform.OS === 'ios' ? 'slide' : 'fade'}
        transparent={true}
        onRequestClose={() => {
          setModalVisible(false);
          setForm(EMPTY_CLIENT);
          setFormErrors({});
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
          <View style={clientStyles.modalContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', flex: 1 }}>New Patient</Text>
              <TouchableOpacity onPress={handleSubmit} style={{ marginRight: 16 }} testID="save-client-button">
                <SaveIcon size={26} color={COLORS.vata[500]} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setModalVisible(false); setForm(EMPTY_CLIENT); setFormErrors({}); }} testID="cancel-modal-button">
                <CancelIcon size={26} color={COLORS.error} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              {/* Row 1: Prefix + Name */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 18 }}>
                {/* Prefix dropdown */}
                <View style={{ width: 88, height: 44, justifyContent: 'center', alignItems: 'center', marginStart: 16 }}>
                  <PrefixPicker
                    value={form.prefix ? form.prefix : undefined}
                    onChange={(v: string) => handleFormChange('prefix', v)}
                  />
                </View>
                {/* Name input */}
                <View style={{ flex: 1, justifyContent: 'center', marginBottom: 2 }}>
                  <FormField
                    label=""
                    value={form.name || ''}
                    onChange={(v: string) => handleFormChange('name', v)}
                    placeholder="Name"
                    error={formErrors.name}
                    containerStyle={{ height: 44, justifyContent: 'center' }}
                    inputStyle={{ height: 44, paddingVertical: 10, textAlignVertical: 'center', marginStart: 8 }}
                  />
                </View>
              </View>

              {/* Row 2: Gender */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Text style={{ fontSize: 15, fontWeight: '600' }}>Gender:</Text>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity key={g} style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8 }} onPress={() => handleFormChange('gender', g)}>
                    <View style={{
                      height: 20,
                      width: 20,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: COLORS.vata[500],
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: form.gender === g ? COLORS.vata[100] : '#fff',
                      marginRight: 2,
                    }}>
                      {form.gender === g && (
                        <View style={{ height: 12, width: 12, borderRadius: 2, backgroundColor: COLORS.vata[500] }} />
                      )}
                    </View>
                    <Text style={{ fontSize: 15 }}>{g}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 3: Mobile Number */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <CountryCodePicker value={form.mobileCode || '+91'} onChange={(code: string) => handleFormChange('mobileCode', code)} />
                <View style={{ flex: 1 }}>
                  <FormField
                    label=""
                    value={form.mobile || ''}
                    onChange={(v: string) => handleFormChange('mobile', v.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    error={formErrors.mobile}
                    placeholder="Mobile"
                  />
                </View>
              </View>

              {/* Row 4: Alternate Mobile Number */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <CountryCodePicker value={form.altMobileCode || '+91'} onChange={(code: string) => handleFormChange('altMobileCode', code)} />
                <View style={{ flex: 1 }}>
                  <FormField
                    label=""
                    value={form.altMobile || ''}
                    onChange={(v: string) => handleFormChange('altMobile', v.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    error={formErrors.altMobile}
                    placeholder="Alternate Mobile"
                  />
                </View>
              </View>

              {/* Row 5: Email */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Email"
                    value={form.email || ''}
                    onChange={(v: string) => handleFormChange('email', v)}
                    keyboardType="email-address"
                    placeholder="e.g. john@example.com"
                    error={formErrors.email}
                    inputStyle={{ height: 44, paddingVertical: 0 }}
                  />
                </View>
              </View>

              {/* Row 6: DOB and Age */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                {/* DOB Picker with icon inside cell */}
                <View style={{ flex: 3, position: 'relative', justifyContent: 'center' }}>
                  <GenericDatePicker
                    label="DOB"
                    value={form.dob || ''}
                    onChange={(v: string) => {
                      handleFormChange('dob', v);
                      if (v) {
                        const age = calculateAge(v);
                        handleFormChange('age', age);
                      }
                    }}
                    style={{ ...clientStyles.formField, height: 44, paddingRight: 32, justifyContent: 'center' }}
                    inputStyle={{ ...clientStyles.input, height: 44, paddingVertical: 0, paddingRight: 32, justifyContent: 'center' }}
                    testID="dob-picker"
                  />
                </View>
                {/* Age input with 'Years' */}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <FormField
                    label=""
                    value={form.age || ''}
                    placeholder="Age"
                    onChange={(v: string) => handleFormChange('age', v.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    inputStyle={{ height: 40, paddingVertical: 0, width: 80 }}
                  />
                  <Text style={{ marginLeft: 6, fontSize: 15, color: '#333' }}>Years</Text>
                </View>
              </View>

              {/* Row 7: Height, Weight */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <FormField label="" value={form.height ? String(form.height) : ''} onChange={(v: string) => handleFormChange('height', v)} keyboardType="numeric" error={formErrors.height} placeholder="Height (cm)" />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField label="" value={form.weight ? String(form.weight) : ''} onChange={(v: string) => handleFormChange('weight', v)} keyboardType="numeric" error={formErrors.weight} placeholder="Weight (kg)" />
                </View>
              </View>

              {/* Row 8: Present complaints */}
              <FormField label="" value={form.presentComplaints || ''} onChange={(v: string) => handleFormChange('presentComplaints', v)} multiline placeholder="Present complaints" />

              {/* Row 9: Known issues checkboxes */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', marginBottom: 8 }}>Known issues</Text>
                <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                  {['BP', 'DM', 'Hypo Thyroidism'].map((issue) => (
                    <TouchableOpacity key={issue} style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => handleKnownIssuesChange(issue)}>
                      <View style={{
                        height: 20,
                        width: 20,
                        borderRadius: 4,
                        borderWidth: 2,
                        borderColor: COLORS.vata[500],
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 6,
                        backgroundColor: form.knownIssues?.includes(issue) ? COLORS.vata[100] : '#fff',
                      }}>
                        {form.knownIssues?.includes(issue) && <View style={{ height: 12, width: 12, borderRadius: 2, backgroundColor: COLORS.vata[500] }} />}
                      </View>
                      <Text style={{ fontSize: 15 }}>{issue}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Row 10: Past illnesses */}
              <FormField label="" value={form.pastIllnesses || ''} onChange={(v: string) => handleFormChange('pastIllnesses', v)} multiline placeholder="Past illnesses" />

              {/* Row 11: Allergies */}
              <FormField label="" value={form.allergies || ''} onChange={(v: string) => handleFormChange('allergies', v)} multiline placeholder="Allergies" />

              {/* Row 12: Family History */}
              <FormField label="" value={form.familyHistory || ''} onChange={(v: string) => handleFormChange('familyHistory', v)} multiline placeholder="Family History" />

              {/* Row 13: Current Medication */}
              <FormField label="" value={form.currentMedication || ''} onChange={(v: string) => handleFormChange('currentMedication', v)} multiline placeholder="Current Medication" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default ClientsScreen;