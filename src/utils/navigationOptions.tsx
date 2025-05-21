import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '@/theme/constants/theme';
import { RelativePathString, router } from 'expo-router';

export const getHeaderWithBack = (title: string, showBack = true) => ({
  title,
  headerLeft: () =>
    showBack ? (
      <TouchableOpacity
        onPress={() => {
          try {
            // @ts-ignore - router.canGoBack may not exist in all expo-router versions
            if (typeof router.canGoBack === 'function' ? router.canGoBack() : false) {
              router.back();
            } else {
              router.replace('/(admin)/clinics');
            }
          } catch {
            router.replace('/(admin)/clinics');
          }
        }}
        style={{ paddingLeft: 16 }}
      >
        <ArrowLeft size={24} color={COLORS.neutral[700]} />
      </TouchableOpacity>
    ) : null,
});