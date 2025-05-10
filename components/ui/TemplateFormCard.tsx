import React from 'react';
import { View, StyleSheet } from 'react-native';
import TextInput from './TextInput';
import Button from './Button';
import {Picker} from './Picker';

interface TemplateFormCardProps {
  name: string;
  content: string;
  type: string;
  onChangeName: (value: string) => void;
  onChangeContent: (value: string) => void;
  onChangeType: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TEMPLATE_TYPES = [
  { label: 'Appointment Confirmation', value: 'appointment_confirmation' },
  { label: 'Reschedule Notice', value: 'reschedule_notice' },
  { label: 'Follow-up Reminder', value: 'followup_reminder' },
];

export const TemplateFormCard: React.FC<TemplateFormCardProps> = ({
  name,
  content,
  type,
  onChangeName,
  onChangeContent,
  onChangeType,
  onSave,
  onCancel,
  isLoading,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        label="Template Name"
        value={name}
        onChangeText={onChangeName}
        placeholder="Enter template name"
      />

      <Picker
        label="Template Type"
        items={TEMPLATE_TYPES}
        selectedValue={type}
        onValueChange={onChangeType}
      />

      <TextInput
        label="Message Content"
        value={content}
        onChangeText={onChangeContent}
        multiline
        numberOfLines={4}
        placeholder="Enter message content with {{variables}}"
        helper="Use {{name}}, {{date}}, {{time}} as variables"
        maxLength={500}
      />

      <View style={styles.actions}>
        <Button
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.button}
        />
        <Button
          title="Save Template"
          onPress={onSave}
          isLoading={isLoading}
          style={styles.button}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});