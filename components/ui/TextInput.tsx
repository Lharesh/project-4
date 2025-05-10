import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '@/constants/theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  helperStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  containerStyle,
  labelStyle,
  inputStyle,
  helperStyle,
  errorStyle,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      )}

      <View style={styles.inputContainer}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <RNTextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={COLORS.neutral[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />

        {(rightIcon || secureTextEntry) && (
          <View style={styles.rightIcon}>
            {secureTextEntry && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            )}
            {rightIcon}
          </View>
        )}
      </View>

      {(error || helper) && (
        <Text style={[error ? styles.error : styles.helper, error ? errorStyle : helperStyle]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: COLORS.neutral[700],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.neutral[300],
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.neutral[900],
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  error: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  helper: {
    fontSize: 12,
    color: COLORS.neutral[500],
    marginTop: 4,
  },
});