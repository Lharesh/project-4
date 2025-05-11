import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTreatmentSlots } from '@/redux/slices/setupSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TextInput } from '@/components/ui/TextInput';
import { COLORS } from '@/constants/theme';
import { Clock, IndianRupee, Trash2, Plus, CreditCard as Edit2 } from 'lucide-react-native';
import { Toast } from '@/components/ui/Toast';

interface EditingTreatment {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
}

export default function TreatmentSlotsScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { treatmentSlots, isLoading } = useAppSelector((state) => state.setup);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<EditingTreatment | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user?.clinicId) {
      dispatch(fetchTreatmentSlots(user.clinicId));
    }
  }, [user?.clinicId]);

  const handleEdit = (treatment: any) => {
    setEditingId(treatment.id);
    setEditingTreatment({
      id: treatment.id,
      name: treatment.name,
      duration: treatment.duration.toString(),
      price: treatment.price.toString(),
      description: treatment.description,
    });
  };

  const handleSave = (id: string) => {
    if (!editingTreatment) return;

    const duration = parseInt(editingTreatment.duration);
    const price = parseFloat(editingTreatment.price);

    if (isNaN(duration) || duration <= 0) {
      setToastMessage('Duration must be a positive number');
      setToastType('error');
      setShowToast(true);
      return;
    }

    if (isNaN(price) || price <= 0) {
      setToastMessage('Price must be a positive number');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Save logic here
    setToastMessage('Treatment updated successfully');
    setToastType('success');
    setShowToast(true);
    setEditingId(null);
    setEditingTreatment(null);
  };

  const handleDelete = (id: string) => {
    // Delete logic here
    setToastMessage('Treatment deleted successfully');
    setToastType('success');
    setShowToast(true);
  };

  const handleAdd = () => {
    setEditingId('new');
    setEditingTreatment({
      id: 'new',
      name: '',
      duration: '',
      price: '',
      description: '',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        title="Add Treatment"
        leftIcon={<Plus size={20} color={COLORS.white} />}
        style={styles.addButton}
        onPress={handleAdd}
      />

      {treatmentSlots.map((treatment) => (
        <Card key={treatment.id} style={styles.card}>
          {editingId === treatment.id ? (
            <View style={styles.editForm}>
              <TextInput
                label="Treatment Name"
                value={editingTreatment?.name}
                onChangeText={(value) => setEditingTreatment(prev => ({ ...prev!, name: value }))}
                placeholder="Enter treatment name"
              />
              
              <View style={styles.row}>
                <TextInput
                  label="Duration (minutes)"
                  value={editingTreatment?.duration}
                  onChangeText={(value) => setEditingTreatment(prev => ({ ...prev!, duration: value }))}
                  keyboardType="numeric"
                  style={styles.halfInput}
                />
                <TextInput
                  label="Price (₹)"
                  value={editingTreatment?.price}
                  onChangeText={(value) => setEditingTreatment(prev => ({ ...prev!, price: value }))}
                  keyboardType="numeric"
                  style={styles.halfInput}
                />
              </View>

              <TextInput
                label="Description"
                value={editingTreatment?.description}
                onChangeText={(value) => setEditingTreatment(prev => ({ ...prev!, description: value }))}
                multiline
                numberOfLines={3}
              />

              <View style={styles.actionButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => {
                    setEditingId(null);
                    setEditingTreatment(null);
                  }}
                  style={styles.actionButton}
                />
                <Button
                  title="Save"
                  onPress={() => handleSave(treatment.id)}
                  style={styles.actionButton}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View>
                  <Text style={styles.name}>{treatment.name}</Text>
                  <Text style={styles.description}>{treatment.description}</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleEdit(treatment)}
                    style={styles.iconButton}
                  >
                    <Edit2 size={20} color={COLORS.vata[600]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(treatment.id)}
                    style={styles.iconButton}
                  >
                    <Trash2 size={20} color={COLORS.pitta[600]} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailItem}>
                  <Clock size={16} color={COLORS.neutral[500]} />
                  <Text style={styles.detailText}>{treatment.duration} mins</Text>
                </View>
                <View style={styles.detailItem}>
                  <IndianRupee size={16} color={COLORS.neutral[500]} />
                  <Text style={styles.detailText}>₹{treatment.price}</Text>
                </View>
              </View>
            </>
          )}
        </Card>
      ))}

      {editingId === 'new' && (
        <Card style={styles.card}>
          <View style={styles.editForm}>
            <TextInput
              label="Treatment Name"
              value={editingTreatment?.name}
              onChangeText={(value) => setEditingTreatment(prev => ({ ...prev!, name: value }))}
              placeholder="Enter treatment name"
            />
            
            <View style={styles.row}>
              <TextInput
                label="Duration (minutes)"
                value={editingTreatment?.duration}
                onChangeText={(value) => setEditingTreatment(prev => ({ ...prev!, duration: value }))}
                keyboardType="numeric"
                style={styles.halfInput}
              />
              <TextInput
                label="Price (₹)"
                value={editingTreatment?.price}
                onChangeText={(value) => setEditingTreatment(prev => ({ ...prev!, price: value }))}
                keyboardType="numeric"
                style={styles.halfInput}
              />
            </View>

            <TextInput
              label="Description"
              value={editingTreatment?.description}
              onChangeText={(value) => setEditingTreatment(prev => ({ ...prev!, description: value }))}
              multiline
              numberOfLines={3}
            />

            <View style={styles.actionButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => {
                  setEditingId(null);
                  setEditingTreatment(null);
                }}
                style={styles.actionButton}
              />
              <Button
                title="Add"
                onPress={() => handleSave('new')}
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
  description: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: COLORS.neutral[700],
  },
  editForm: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});