import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';
import { router } from 'expo-router';

export const getHeaderWithBack = (title: string, showBack = true) => ({
  title,
  headerLeft: () =>
    showBack ? (
      <TouchableOpacity onPress={() => router.back()} style={{ paddingLeft: 16 }}>
        <ArrowLeft size={24} color={COLORS.neutral[700]} />
      </TouchableOpacity>
    ) : null,
});