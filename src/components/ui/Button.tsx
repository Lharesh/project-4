import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { COLORS } from '@/theme/constants/theme';
import { ButtonProps } from './types';

type ButtonSizeStyle = {
  fontSize: number;
  paddingVertical: number;
  paddingHorizontal: number;
};

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  ...props
}: ButtonProps) => {
  const getButtonStyles = (): ViewStyle => {
    const base: ViewStyle = {
      ...styles.button,
      ...getSizeStyles(false, size),
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: COLORS.vata[500] };
      case 'secondary':
        return { ...base, backgroundColor: COLORS.pitta[500] };
      case 'outline':
        return { ...base, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.vata[500] };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      case 'destructive':
        return { ...base, backgroundColor: COLORS.pitta[600] };
      default:
        return base;
    }
  };

  const getTextStyles = (): TextStyle => {
    const base: TextStyle = {
      ...styles.text,
      ...getSizeStyles(true, size),
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'destructive':
        return { ...base, color: COLORS.white };
      case 'outline':
      case 'ghost':
        return { ...base, color: COLORS.vata[500] };
      default:
        return base;
    }
  };

  const getSizeStyles = (isText: boolean, size: string): ButtonSizeStyle => {
    const sizeStyles: Record<string, ButtonSizeStyle> = {
      sm: { fontSize: 14, paddingVertical: 6, paddingHorizontal: 12 },
      md: { fontSize: 16, paddingVertical: 8, paddingHorizontal: 16 },
      lg: { fontSize: 18, paddingVertical: 10, paddingHorizontal: 20 },
    };

    const sizeStyle = sizeStyles[size];
    return sizeStyle;
  };

  return (
    <TouchableOpacity
      {...props}
      disabled={isLoading || props.disabled}
      style={[
        getButtonStyles(),
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.vata[500] : COLORS.white}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <Text style={[getTextStyles(), textStyle]}>{title}</Text>
          {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
  fullWidth: {
    width: '100%',
  },
});
type ButtonTextSize = {
  fontSize: number;
};

type ButtonPaddingStyle = {
  paddingVertical: number;
  paddingHorizontal: number;
};

export default Button;