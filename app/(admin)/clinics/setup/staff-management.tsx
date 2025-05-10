import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchStaff, addStaffMember, updateStaffMember, deleteStaffMember } from '@/redux/slices/setupSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { Picker } from '@/components/ui/Picker';
import { Toast } from '@/components/ui/Toast';
import { COLORS } from '@/constants/theme';
import { Mail, Phone, Stethoscope, CreditCard as Edit2, Trash2, Plus } from 'lucide-react-native';

const ROLE_OPTIONS = [
  { label: 'Doctor', value: 'doctor' },
  { label: 'Therapist', value: 'therapist' },
  { label: 'Admin', value: 'admin' },
  { label: 'Receptionist', value: 'receptionist' },
];

interface StaffFormData {
  name: string;
  email: string;
  phone: string;
  role: 'doctor' | 'therapist' | 'admin' | 'receptionist';
  specialization?: string;
}

export default function StaffManagementScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { staff, isLoading } = useAppSelector((state) => state.setup);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'doctor',
    specialization: '',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user?.clinicId) {
      dispatch(fetchStaff(user.clinicId));
    }
  }, [user?.clinicId]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setToastMessage('Name is required');
      setToastType('error');
      setShowToast(true);
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setToastMessage('Valid email is required');
      setToastType('error');
      setShowToast(true);
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setToastMessage('Valid phone number is required');
      setToastType('error');
      setShowToast(true);
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingId === 'new') {
        await dispatch(addStaffMember({
          ...formData,
          isActive: true,
        })).unwrap();
        setToastMessage('Staff member added successfully');
      } else if (editingId) {
        await dispatch(updateStaffMember({
          id: editingId,
          ...formData,
          isActive: true,
        })).unwrap();
        setToastMessage('Staff member updated successfully');
      }
      setToastType('success');
      setShowToast(true);
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'doctor',
        specialization: '',
      });
    } catch (error) {
      setToastMessage('Failed to save staff member');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteStaffMember(id)).unwrap();
      setToastMessage('Staff member deleted successfully');
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to delete staff member');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      specialization: member.specialization || '',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        title="Add Staff Member"
        leftIcon={<Plus size={20} color={COLORS.white} />}
        style={styles.addButton}
        onPress={() => {
          setEditingId('new');
          setFormData({
            name: '',
            email: '',
            phone: '',
            role: 'doctor',
            specialization: '',
          });
        }}
      />

      {staff.map((member) => (
        <Card key={member.id} style={styles.card}>
          {editingId === member.id ? (
            <View style={styles.form}>
              <TextInput
                label="Name"
                value={formData.name}
                onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
              />
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
                keyboardType="email-address"
              />
              <TextInput
                label="Phone"
                value={formData.phone}
                onChangeText={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                keyboardType="phone-pad"
              />
              <Picker
                label="Role"
                items={ROLE_OPTIONS}
                selectedValue={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
              />
              {(formData.role === 'doctor' || formData.role === 'therapist') && (
                <TextInput
                  label="Specialization"
                  value={formData.specialization}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
                />
              )}
              <View style={styles.formActions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setEditingId(null)}
                  style={styles.actionButton}
                />
                <Button
                  title="Save"
                  onPress={handleSave}
                  style={styles.actionButton}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View>
                  <Text style={styles.name}>{member.name}</Text>
                  <Text style={styles.role}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleEdit(member)}
                    style={styles.iconButton}
                  >
                    <Edit2 size={20} color={COLORS.vata[600]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(member.id)}
                    style={styles.iconButton}
                  >
                    <Trash2 size={20} color={COLORS.pitta[600]} />
                  </TouchableOpacity>
                </View>
              </View>

              {member.specialization && (
                <View style={styles.specialization}>
                  <Stethoscope size={16} color={COLORS.neutral[500]} />
                  <Text style={styles.specializationText}>
                    {member.specialization}
                  </Text>
                </View>
              )}

              <View style={styles.contactInfo}>
                <View style={styles.contactItem}>
                  <Mail size={16} color={COLORS.neutral[500]} />
                  <Text style={styles.contactText}>{member.email}</Text>
                </View>
                <View style={styles.contactItem}>
                  <Phone size={16} color={COLORS.neutral[500]} />
                  <Text style={styles.contactText}>{member.phone}</Text>
                </View>
              </View>
            </>
          )}
        </Card>
      ))}

      {editingId === 'new' && (
        <Card style={styles.card}>
          <View style={styles.form}>
            <TextInput
              label="Name"
              value={formData.name}
              onChangeText={(value) => setFormData(prev => ({ ...prev, name: value }))}
            />
            <TextInput
              label="Email"
              value={formData.email}
              onChangeText={(value) => setFormData(prev => ({ ...prev, email: value }))}
              keyboardType="email-address"
            />
            <TextInput
              label="Phone"
              value={formData.phone}
              onChangeText={(value) => setFormData(prev => ({ ...prev, phone: value }))}
              keyboardType="phone-pad"
            />
            <Picker
              label="Role"
              items={ROLE_OPTIONS}
              selectedValue={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as any }))}
            />
            {(formData.role === 'doctor' || formData.role === 'therapist') && (
              <TextInput
                label="Specialization"
                value={formData.specialization}
                onChangeText={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
              />
            )}
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditingId(null)}
                style={styles.actionButton}
              />
              <Button
                title="Add"
                onPress={handleSave}
                style={styles.actionButton}
              />
            </View>
          </View>
        </Card>
      )}

      <Toast
        visible={showToast}
        type={toastType}
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: COLORS.neutral[50],
  },
  addButton: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: COLORS.vata[600],
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  specialization: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  specializationText: {
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  contactInfo: {
    gap: 8,
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
  form: {
    gap: 16,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});