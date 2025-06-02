import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Mail, CircleCheck as CheckCircle } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { forgotPassword } from './authSlice';
import { TextInput } from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { COLORS } from '@/theme/constants/theme';

export default function ForgotPasswordScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info' | 'warning'>('error');

  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
    }
  }, [error]);

  const handleSubmit = async () => {
    if (email.trim() === '') {
      setToastMessage('Please enter your email');
      setToastType('error');
      setShowToast(true);
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassword(email));
      if (forgotPassword.fulfilled.match(resultAction)) {
        setIsSuccess(true);
        setToastMessage('Password reset instructions sent to your email');
        setToastType('success');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.neutral[700]} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <Text style={styles.headerSubtitle}>
            Enter your email to receive password reset instructions
          </Text>
        </View>

        {!isSuccess ? (
          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              placeholder="Enter your email"
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={<Mail size={20} color={COLORS.neutral[400]} />}
              value={email}
              onChangeText={setEmail}
            />

            <Button
              title="Reset Password"
              variant="primary"
              size="lg"
              fullWidth
              style={styles.submitButton}
              isLoading={isLoading}
              disabled={email.trim() === '' || isLoading}
              onPress={handleSubmit}
            />
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successIcon}>
              <CheckCircle size={60} color={COLORS.kapha[500]} />
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successMessage}>
              We've sent password reset instructions to {email}
            </Text>
            <Button
              title="Back to Login"
              variant="primary"
              size="lg"
              style={styles.backToLoginButton}
              onPress={() => router.push('/auth/login')}
            />
          </View>
        )}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>

        <Toast
          visible={showToast}
          type={toastType}
          message={toastMessage}
          onDismiss={() => setShowToast(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    padding: 8,
    marginTop: 20,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.neutral[600],
  },
  formContainer: {
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 24,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.neutral[900],
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    color: COLORS.neutral[600],
    textAlign: 'center',
    marginBottom: 24,
  },
  backToLoginButton: {
    minWidth: 200,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
    paddingVertical: 20,
  },
  loginText: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.vata[600],
    fontWeight: '500',
  },
});