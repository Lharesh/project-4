import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { Building2, Mail, Phone, MapPin } from 'lucide-react-native';
import { COLORS } from '@/theme/constants/theme';

interface ClinicFormProps {
  name: string;
  email: string;
  phone: string;
  address: string;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePhone: (value: string) => void;
  onChangeAddress: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const ClinicForm: React.FC<ClinicFormProps> = ({
  name,
  email,
  phone,
  address,
  onChangeName,
  onChangeEmail,
  onChangePhone,
  onChangeAddress,
  onSubmit,
  isLoading,
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        label="Clinic Name"
        value={name}
        onChangeText={onChangeName}
        leftIcon={<Building2 size={20} color={COLORS.neutral[400]} />}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={onChangeEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={<Mail size={20} color={COLORS.neutral[400]} />}
      />

      <TextInput
        label="Phone"
        value={phone}
        onChangeText={onChangePhone}
        keyboardType="phone-pad"
        leftIcon={<Phone size={20} color={COLORS.neutral[400]} />}
      />

      <TextInput
        label="Address"
        value={address}
        onChangeText={onChangeAddress}
        multiline
        numberOfLines={3}
        leftIcon={<MapPin size={20} color={COLORS.neutral[400]} />}
      />

      <Button
        title="Save Changes"
        onPress={onSubmit}
        isLoading={isLoading}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  button: {
    marginTop: 8,
  },
});