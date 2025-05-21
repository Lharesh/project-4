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
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { login } from './authSlice';
import { TextInput } from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { COLORS } from '@/constants/theme';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    setIsFormValid(email.trim() !== '' && password.trim() !== '');
  }, [email, password]);

  // useEffect(() => {
//     if (isAuthenticated) {
//       router.replace('/');
//     }
//   }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setShowToast(true);
    }
  }, [error]);

  const handleLogin = async () => {
    if (!isFormValid) {
      setToastMessage('Please fill in all fields');
      setShowToast(true);
      return;
    }

    dispatch(login({ email, password }));
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
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to your account</Text>
        </View>

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

          <TextInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            leftIcon={<Lock size={20} color={COLORS.neutral[400]} />}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Login"
            variant="primary"
            size="lg"
            fullWidth
            style={styles.loginButton}
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
            onPress={handleLogin}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Toast
          visible={showToast}
          type="error"
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: COLORS.vata[600],
    fontWeight: '500',
  },
  loginButton: {
    marginBottom: 24,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: COLORS.neutral[600],
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.vata[600],
    fontWeight: '500',
  },
});