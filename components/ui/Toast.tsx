import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { X, Check, TriangleAlert as AlertTriangle, CircleAlert as AlertCircle, Info } from 'lucide-react-native';
import { COLORS } from '@/constants/theme';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  type: ToastType;
  message: string;
  onDismiss: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  type,
  message,
  onDismiss,
  duration = 3000,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: COLORS.kapha[50],
          borderColor: COLORS.kapha[500],
          iconColor: COLORS.kapha[500],
        };
      case 'error':
        return {
          backgroundColor: COLORS.pitta[50],
          borderColor: COLORS.pitta[500],
          iconColor: COLORS.pitta[500],
        };
      case 'warning':
        return {
          backgroundColor: COLORS.warning + '20', // 20% opacity
          borderColor: COLORS.warning,
          iconColor: COLORS.warning,
        };
      case 'info':
        return {
          backgroundColor: COLORS.vata[50],
          borderColor: COLORS.vata[500],
          iconColor: COLORS.vata[500],
        };
      default:
        return {
          backgroundColor: COLORS.neutral[50],
          borderColor: COLORS.neutral[500],
          iconColor: COLORS.neutral[500],
        };
    }
  };

  const toastStyle = getToastStyles();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check size={20} color={toastStyle.iconColor} />;
      case 'error':
        return <AlertCircle size={20} color={toastStyle.iconColor} />;
      case 'warning':
        return <AlertTriangle size={20} color={toastStyle.iconColor} />;
      case 'info':
        return <Info size={20} color={toastStyle.iconColor} />;
      default:
        return <Info size={20} color={toastStyle.iconColor} />;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: toastStyle.backgroundColor,
          borderColor: toastStyle.borderColor,
        },
      ]}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
        <X size={16} color={COLORS.neutral[500]} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 999,
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: COLORS.neutral[800],
  },
  closeButton: {
    padding: 4,
  },
});