// app/(admin)/clinics/setup/whatsapp-templates.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTemplates } from './setupSlice';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { TemplateFormCard } from '@/components/ui/TemplateFormCard';
import { Toast } from '@/components/ui/Toast';
import { COLORS } from '@/theme/constants/theme';
import { MessageSquare, Plus, Variable } from 'lucide-react-native';

export default function WhatsAppTemplatesScreen() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { whatsappTemplates, isLoading } = useAppSelector((state) => state.setup);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    type: 'appointment_confirmation',
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (user?.clinicId) {
      dispatch(fetchTemplates(user.clinicId));
    }
  }, [user?.clinicId]);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      setToastMessage('Please fill in all fields');
      setToastType('error');
      setShowToast(true);
      return;
    }

    // Simulate saving
    setToastMessage('Template saved successfully');
    setToastType('success');
    setShowToast(true);
    setShowForm(false);
    setFormData({
      name: '',
      content: '',
      type: 'appointment_confirmation',
    });

    // In mock dev, append to mock list (if using local state)
    // In redux, dispatch(addTemplate(formData)) in real setup
  };

  return (
    <ScrollView style={styles.container}>
      <Button
        title="Add Template"
        leftIcon={<Plus size={20} color={COLORS.white} />}
        style={styles.addButton}
        onPress={() => setShowForm(true)}
      />

      {showForm && (
        <Card style={styles.formCard}>
          <TemplateFormCard
            name={formData.name}
            content={formData.content}
            type={formData.type}
            onChangeName={(value) => setFormData(prev => ({ ...prev, name: value }))}
            onChangeContent={(value) => setFormData(prev => ({ ...prev, content: value }))}
            onChangeType={(value) => setFormData(prev => ({ ...prev, type: value }))}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            isLoading={isLoading}
          />
        </Card>
      )}

      {whatsappTemplates.map((template) => (
        <Card key={template.id} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <MessageSquare size={20} color={COLORS.vata[500]} />
              <Text style={styles.name}>{template.name}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: template.isActive
                    ? COLORS.kapha[100]
                    : COLORS.neutral[100],
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color: template.isActive
                      ? COLORS.kapha[700]
                      : COLORS.neutral[600],
                  },
                ]}
              >
                {template.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>
          </View>

          <Text style={styles.content}>{template.content}</Text>

          {Array.isArray(template.variables) && template.variables.length > 0 && (
            <View style={styles.variables}>
              <View style={styles.variableHeader}>
                <Variable size={16} color={COLORS.neutral[500]} />
                <Text style={styles.variableTitle}>Variables</Text>
              </View>
              <View style={styles.variableList}>
                {template.variables.map((variable, index) => (
                  <View key={index} style={styles.variableTag}>
                    <Text style={styles.variableText}>{variable}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>
      ))}

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
  formCard: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral[900],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    fontSize: 14,
    color: COLORS.neutral[700],
    marginBottom: 16,
  },
  variables: {
    backgroundColor: COLORS.neutral[50],
    padding: 12,
    borderRadius: 8,
  },
  variableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  variableTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral[700],
  },
  variableList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  variableTag: {
    backgroundColor: COLORS.vata[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  variableText: {
    fontSize: 12,
    color: COLORS.vata[700],
  },
});
