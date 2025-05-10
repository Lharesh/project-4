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
import { ArrowLeft, Mail, Lock, User } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { register } from '@/redux/slices/authSlice';
import { TextInput } from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { COLORS } from '@/constants/theme';

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'error' | 'success' | 'info' | 'warning'>('error');

  useEffect(() => {
    const isValid = 
      name.trim() !== '' &&
      email.trim() !== '' &&
      password.trim() !== '' &&
      confirmPassword.trim() !== '' &&
      password === confirmPassword;
    
    setIsFormValid(isValid);
  }, [name, email, password, confirmPassword]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/appointments');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      setToastMessage(error);
      setToastType('error');
      setShowToast(true);
    }
  }, [error]);

  const handleRegister = async () => {
    if (!isFormValid) {
      if (password !== confirmPassword) {
        setToastMessage('Passwords do not match');
      } else {
        setToastMessage('Please fill in all fields');
      }
      setToastType('error');
      setShowToast(true);
      return;
    }

    dispatch(register({ name, email, password, }));
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
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join the AyurAIClinics community</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Full Name"
            placeholder="Enter your full name"
            leftIcon={<User size={20} color={COLORS.neutral[400]} />}
            value={name}
            onChangeText={setName}
          />

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
            placeholder="Create a password"
            secureTextEntry
            leftIcon={<Lock size={20} color={COLORS.neutral[400]} />}
            value={password}
            onChangeText={setPassword}
            helper="Password must be at least 8 characters"
          />

          <TextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            secureTextEntry
            leftIcon={<Lock size={20} color={COLORS.neutral[400]} />}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={password !== confirmPassword && confirmPassword.length > 0 ? "Passwords don't match" : undefined}
          />

          <Button
            title="Register"
            variant="primary"
            size="lg"
            fullWidth
            style={styles.registerButton}
            isLoading={isLoading}
            disabled={!isFormValid || isLoading}
            onPress={handleRegister}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
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
  registerButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
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