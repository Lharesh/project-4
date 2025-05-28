import * as React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { TextInput, useTheme, HelperText } from 'react-native-paper';

interface AppTextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  style?: StyleProp<ViewStyle>;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  disabled?: boolean;
}

const AppTextField: React.FC<AppTextFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error = false,
  helperText,
  style,
  secureTextEntry = false,
  keyboardType = 'default',
  disabled = false,
}) => {
  // Separate container (ViewStyle) and input (TextStyle) styles
  const containerStyleProps = [
    'flex', 'flexDirection', 'justifyContent', 'alignItems', 'alignSelf', 'margin', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'marginHorizontal', 'marginVertical', 'padding', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'paddingHorizontal', 'paddingVertical', 'height', 'width', 'minHeight', 'minWidth', 'maxHeight', 'maxWidth', /* REMOVE 'backgroundColor' */, 'borderRadius', 'borderWidth', 'borderColor', 'overflow', 'position', 'top', 'bottom', 'left', 'right', 'zIndex', 'elevation', 'shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius',
  ];
  const textInputStyleProps = [
    'backgroundColor', // ADD THIS
    'color', 'fontSize', 'fontWeight', 'fontFamily', 'fontStyle', 'letterSpacing', 'lineHeight', 'textAlign', 'textDecorationLine', 'textDecorationStyle', 'textDecorationColor', 'textShadowColor', 'textShadowOffset', 'textShadowRadius', 'includeFontPadding', 'textAlignVertical',
  ];
  let containerStyle: Record<string, any> = {};
  let textInputStyle: Record<string, any> = {};
  if (Array.isArray(style)) {
    style.forEach(s => {
      if (!s) return;
      Object.entries(s).forEach(([k, v]) => {
        if (containerStyleProps.includes(k)) {
          containerStyle[k] = v;
        } else if (textInputStyleProps.includes(k)) {
          textInputStyle[k] = v;
        }
      });
    });
  } else if (style) {
    Object.entries(style).forEach(([k, v]) => {
      if (containerStyleProps.includes(k)) {
        containerStyle[k] = v;
      } else if (textInputStyleProps.includes(k)) {
        textInputStyle[k] = v;
      }
    });
  }
  const theme = useTheme();

  return (
    <View style={containerStyle}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        error={error}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        disabled={disabled}
        // Only TextStyle props are passed to TextInput
        style={textInputStyle}
        theme={theme}
      />
      {helperText ? (
        <HelperText type={error ? 'error' : 'info'} visible={true}>
          {helperText}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    backgroundColor: 'white',
  },
});

export default AppTextField;
